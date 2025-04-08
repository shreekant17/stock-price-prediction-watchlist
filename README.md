# Stock Watchlist & Prediction System

## Overview
This project is a full-stack application that allows users to create watchlists for **NSE** stocks and receive **LSTM-based stock price predictions**. Users can search for stocks, add them to their watchlists, and view predictions powered by a machine learning model.

## Features
- **User Profiles**: Secure authentication for personalized watchlists.
- **Watchlist Management**: Add and remove stocks easily by searching.
- **Stock Search**: Search for any **NSE** stock by name or symbol.
- **LSTM-Based Predictions**: Get AI-driven stock price predictions using an LSTM model.

## Tech Stack
### Frontend (Vite + React)
- **Vite**: Fast build tool for React.
- **React.js**: Modern UI framework.
- **Tailwind CSS**: For styling components.

### Backend (Node.js + Express + MongoDB)
- **Node.js**: JavaScript runtime.
- **Express.js**: Fast and minimalist web framework.
- **MongoDB**: NoSQL database to store user watchlists and stock data.
- **Mongoose**: ORM for MongoDB.

### Machine Learning API (FastAPI + Python)
- **FastAPI**: High-performance API framework for ML integration.
- **LSTM (Long Short-Term Memory)**: Deep learning model for stock price prediction.
- **NumPy, Pandas, TensorFlow**: Core libraries for data processing and ML.

## Installation
### Prerequisites
Ensure you have the following installed:
- **Node.js** & **npm**
- **MongoDB**
- **Python** (with FastAPI & ML dependencies)

### Steps to Run the Project
#### 1. Clone the Repository
```sh
git clone https://github.com/shreekant17/stock-price-prediction-watchlist.git
cd your-project-directory
```

#### 2. Install Dependencies
##### Frontend
```sh
cd client
npm install
npm run dev
```

##### Backend
```sh
cd server
npm install
npm start
```

##### ML Model (FastAPI)
```sh
cd model
pip install -r requirements.txt
uvicorn main:app --reload
```

#### 3. Configure Environment Variables
Set up `.env` files for backend, frontend, and ML API.

#### 4. Access the Application
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`
- **ML API**: `https://shreekantkalwar-stock-prediction-model.hf.space`


## Future Enhancements
- **Live stock price updates**
- **Sentiment analysis on news for better predictions**
- **More advanced ML models (Transformer-based)**

## License
MIT License

---
### Contributors
- Shreekant Kalwar - [GitHub Profile](https://github.com/shreekant17)

Feel free to contribute! 🚀