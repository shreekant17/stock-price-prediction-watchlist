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
from tensorflow.keras.layers import Dense, Dropout, LSTM
from tensorflow.keras.models import Sequential
import tensorflow as tf
from sklearn.metrics import r2_score
import bson
from tensorflow.keras.models import load_model
from keras.models import model_from_json

# Allowed origins (replace with your frontend's URL)
origins = [
    "http://localhost",
    "http://localhost:3000",  # React/Vue/Angular running locally
    "*"  # Add your production frontend domain
]





# MongoDB connection
uri = os.getenv("MONGODB_URI")


client = MongoClient(uri)  # Change this if hosted elsewhere
db = client["stock_db"]
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


# Save model to MongoDB
def save_model_to_mongo(model, stock_symbol, end_date, r2):


   # Convert model structure to JSON (string format)
    model_json = model.to_json()

    # Convert weights (numpy arrays) to list format
    weights_list = [w.tolist() for w in model.get_weights()]


    document = {
        "stock_symbol": stock_symbol,
        "end_date": end_date,
        "model": model_json,
        "weights": weights_list,  # Store model as binary
        "accuracy": r2*100
    }

    models_collection.update_one(
        {"stock_symbol": stock_symbol, "end_date": end_date},  # Find by stock symbol and end date
        {"$set": document},  # Update or insert the entire document
        upsert=True  # Insert if not exists
    )

# Load model from MongoDB
def load_model_from_mongo(stock_symbol, end_date):
    retrieved_doc = models_collection.find_one({"stock_symbol": stock_symbol, "end_date": end_date})
    if retrieved_doc:
        model = model_from_json(retrieved_doc["model"])
        accuracy = retrieved_doc["accuracy"]

        # Convert weights from JSON list back to numpy arrays
        weights = [np.array(w) for w in retrieved_doc["weights"]]

        # Set model weights
        model.set_weights(weights)

        return {"model": model, "accuracy": accuracy}
    return None


def predict(model, stock_symbol, start_date, end_date, future_days=30):
    df = yf.download(stock_symbol, start_date, end_date)

    scaler = MinMaxScaler(feature_range=(0,1))
    df['Close'] = df['Close'].astype(float)  # Ensure correct dtype
    last_100_days = df['Close'].values[-100:].reshape(-1, 1)
    scaled_last_100 = scaler.fit_transform(last_100_days)

    # Predict future stock prices for 30 days
    future_days = 30
    predicted_prices = []
    input_seq = list(scaled_last_100)

    for _ in range(future_days):
        X_test = np.array(input_seq[-100:]).reshape(1, 100, 1)
        pred_price = model.predict(X_test)[0, 0]
        predicted_prices.append(pred_price)
        input_seq.append([pred_price])  # Add prediction to sequence

    # Convert predictions back to original scale
    predicted_prices = scaler.inverse_transform(np.array(predicted_prices).reshape(-1, 1))

    # Generate future dates
    # Use df.index instead of df['Date'] to get the last date
   # Generate future dates, ensuring last date is a Timestamp
    future_dates = pd.date_range(start=pd.to_datetime(df.index[-1]), periods=future_days+1)[1:]
    future_dates = [date.strftime("%Y-%m-%d") for date in future_dates]  # Format as YYYY-MM-DD

    # Create DataFrame
    predicted_df = pd.DataFrame({'date': future_dates, 'price': predicted_prices.flatten()})

    # Convert to list of dictionaries
    return predicted_df.to_dict(orient="records")

# Train, predict, and save model
def train_and_predict_and_save(stock_symbol, start_date, end_date, future_days=30):
    future_predictions = []
    # Try loading the model from MongoDB
    
    stored_model = load_model_from_mongo(stock_symbol, end_date)

    model_source = "Trained new model"
    acc = 0.0

    if stored_model:
        model_source = "Loaded from MongoDB"
        model = stored_model["model"]
        accuracy = stored_model["accuracy"]

        predict(model, stock_symbol, start_date, end_date, future_days)

       
        future_predictions = predict(model, stock_symbol, start_date, end_date, future_days)

        print(f"Loaded existing model for {stock_symbol} ({end_date}) from MongoDB")
    else:
        print(f"Training new model for {stock_symbol} ({end_date})")
        data = yf.download(stock_symbol, start_date, end_date)
        data.reset_index(inplace=True)
        df=data
        train = pd.DataFrame(data[0:int(len(data)*0.70)])
        test = pd.DataFrame(data[int(len(data)*0.70): int(len(data))])
        scaler = MinMaxScaler(feature_range=(0,1))
        train_close = train.iloc[:, 4:5].values
        test_close = test.iloc[:, 4:5].values
        data_training_array = scaler.fit_transform(train_close)
        x_train = []
        y_train = []

        for i in range(100, data_training_array.shape[0]):
            x_train.append(data_training_array[i-100: i])
            y_train.append(data_training_array[i, 0])

        x_train, y_train = np.array(x_train), np.array(y_train)

        model = Sequential()
        model.add(LSTM(units = 50, activation = 'relu', return_sequences=True
                    ,input_shape = (x_train.shape[1], 1)))
        model.add(Dropout(0.2))


        model.add(LSTM(units = 60, activation = 'relu', return_sequences=True))
        model.add(Dropout(0.3))


        model.add(LSTM(units = 80, activation = 'relu', return_sequences=True))
        model.add(Dropout(0.4))


        model.add(LSTM(units = 120, activation = 'relu'))
        model.add(Dropout(0.5))

        model.add(Dense(units = 1))

        model.compile(optimizer = 'adam', loss = 'mean_squared_error', metrics=[tf.keras.metrics.MeanAbsoluteError()])
        model.fit(x_train, y_train,epochs = 100)


        past_100_days = pd.DataFrame(train_close[-100:])
        test_df = pd.DataFrame(test_close)
        final_df = pd.concat([past_100_days, test_df], ignore_index=True)
        input_data = scaler.fit_transform(final_df)

        x_test = []
        y_test = []
        for i in range(100, input_data.shape[0]):
            x_test.append(input_data[i-100: i])
            y_test.append(input_data[i, 0])
        x_test, y_test = np.array(x_test), np.array(y_test)

        y_pred = model.predict(x_test)

        scale_factor = 1/scaler.scale_
        y_pred = y_pred * scale_factor
        y_test = y_test * scale_factor

        # Actual values
        actual = y_test

        # Predicted values
        predicted = y_pred

        # Calculate the R2 score
        r2 = r2_score(actual, predicted)

        print("R2 score:", r2)

        acc = r2*100

        save_model_to_mongo(model, stock_symbol, end_date, r2)
        print(f"Saved model for {stock_symbol} ({end_date}) to MongoDB")

       
        future_predictions = predict(model, stock_symbol, start_date, end_date, future_days)

    return {
        "model_source": model_source,
        "next_trading_day": future_predictions[1]["date"],
        "predicted_price_today": round(future_predictions[1]["price"], 2),
        "future_predictions": future_predictions,
        "accuracy": acc
    }




from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse



@app.get("/", response_class=HTMLResponse)
async def hello():
    try:
        return """
        <html>
            <head><title>Server Status</title></head>
            <body>Server Running OK</body>
        </html>
        """
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
