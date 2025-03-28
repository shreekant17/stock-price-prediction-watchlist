import os
import io
import numpy as np
import pandas as pd
import yfinance as yf
import torch
import torch.nn as nn
import torch.optim as optim
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from sklearn.preprocessing import MinMaxScaler
import uvicorn
from pymongo import MongoClient
import re
import json
from fastapi.middleware.cors import CORSMiddleware


# Allowed origins (replace with your frontend's URL)
origins = [
    "http://localhost",
    "http://localhost:3000",  # React/Vue/Angular running locally
    "*"  # Add your production frontend domain
]





# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")  # Change this if hosted elsewhere
db = client["stock_prediction"]
models_collection = db["models"]

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow sending cookies
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)



# Data model for request
class TrainRequest(BaseModel):
    stock_symbol: str
    start_date: str  # e.g., "2015-01-01"
    end_date: str    # e.g., "2024-01-01"
    future_days: int = 30

# Define LSTM Model using PyTorch
class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=2, output_size=1):
        super(LSTMModel, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        return self.fc(lstm_out[:, -1, :])

# Fetch historical stock data
def get_stock_data(stock_symbol, start_date, end_date):
    df = yf.download(stock_symbol, start=start_date, end=end_date)
    if df.empty:
        raise ValueError("No data fetched. Check symbol or date range.")
    return df[['Close']]

# Prepare data for LSTM model
def prepare_data(df, time_step=60):
    scaler = MinMaxScaler(feature_range=(0,1))
    df_scaled = scaler.fit_transform(df)
    
    X, Y = [], []
    for i in range(len(df_scaled) - time_step):
        X.append(df_scaled[i:i+time_step, 0])
        Y.append(df_scaled[i+time_step, 0])
    
    X, Y = np.array(X), np.array(Y)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))

    # Convert NumPy arrays directly to PyTorch tensors
    X_tensor = torch.from_numpy(X).float()
    Y_tensor = torch.from_numpy(Y).float()

    return X_tensor, Y_tensor, scaler

# Save model to MongoDB
def save_model_to_mongo(model, stock_symbol, end_date):
    buffer = io.BytesIO()
    torch.save(model.state_dict(), buffer)
    buffer.seek(0)

    models_collection.update_one(
        {"stock_symbol": stock_symbol, "end_date": end_date},
        {"$set": {"model_data": buffer.read()}},
        upsert=True
    )

# Load model from MongoDB
def load_model_from_mongo(stock_symbol, end_date):
    model_data = models_collection.find_one({"stock_symbol": stock_symbol, "end_date": end_date})
    if model_data:
        buffer = io.BytesIO(model_data["model_data"])
        model = LSTMModel()
        model.load_state_dict(torch.load(buffer))
        return model
    return None

# Train, predict, and save model
def train_and_predict_and_save(stock_symbol, start_date, end_date, future_days=30):
    df = get_stock_data(stock_symbol, start_date, end_date)
    X, Y, scaler = prepare_data(df)
    
    split = int(len(X) * 0.8)
    X_train, X_test, Y_train, Y_test = X[:split], X[split:], Y[:split], Y[split:]

    # Try loading the model from MongoDB
    model = load_model_from_mongo(stock_symbol, end_date)
    if model:
        model.eval()
        print(f"Loaded existing model for {stock_symbol} ({end_date}) from MongoDB")
    else:
        print(f"Training new model for {stock_symbol} ({end_date})")
        model = LSTMModel()
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)

        # Train the model
        for epoch in range(50):
            optimizer.zero_grad()
            outputs = model(X_train)
            loss = criterion(outputs.squeeze(), Y_train)
            loss.backward()
            optimizer.step()

        # Save model to MongoDB
        save_model_to_mongo(model, stock_symbol, end_date)
        print(f"Saved model for {stock_symbol} ({end_date}) to MongoDB")

    model.eval()
    last_60_days = df[-60:].values.reshape(-1, 1)
    last_60_days_scaled = scaler.transform(last_60_days)
    X_future = torch.tensor(np.array([last_60_days_scaled[:, 0]]), dtype=torch.float32).reshape(1, 60, 1)
    
    predicted_price_today = model(X_future).item()
    predicted_price_today = scaler.inverse_transform([[predicted_price_today]])[0][0]
    next_trading_day = pd.date_range(df.index[-1], periods=2, freq='B')[1].strftime('%Y-%m-%d')

    future_prices = []
    for _ in range(future_days):
        predicted_price = model(X_future).item()
        future_prices.append(predicted_price)
        X_future = torch.cat((X_future[:, 1:, :], torch.tensor([[[predicted_price]]], dtype=torch.float32)), dim=1)

    future_prices = scaler.inverse_transform(np.array(future_prices).reshape(-1, 1))
    future_dates = pd.date_range(df.index[-1], periods=future_days + 1, freq='B')[1:]

    future_predictions = [
        {"date": future_dates[i].strftime("%Y-%m-%d"), "price": round(float(future_prices[i][0]), 2)}
        for i in range(len(future_prices))
    ]

    return {
        "model_source": "Loaded from MongoDB" if model else "Trained new model",
        "next_trading_day": next_trading_day,
        "predicted_price_today": round(predicted_price_today, 2),
        "future_predictions": future_predictions
    }

@app.post("/train")
async def train_model(request: TrainRequest):
    try:
        result = train_and_predict_and_save(
            stock_symbol=request.stock_symbol,
            start_date=request.start_date,
            end_date=request.end_date,
            future_days=request.future_days
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
