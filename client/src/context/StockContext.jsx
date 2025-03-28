
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { toast } from 'sonner';
import axios from 'axios'

// Mock data for stocks and watchlists
const MOCK_STOCKS = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', lastPrice: 182.63, change: 1.25, pChange: 0.69 },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation', lastPrice: 331.83, change: -0.99, pChange: -0.30 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', lastPrice: 130.25, change: 2.33, pChange: 1.82 },
  { symbol: 'AMZN', companyName: 'Amazon.com Inc.', lastPrice: 127.74, change: 0.45, pChange: 0.35 },
  { symbol: 'META', companyName: 'Meta Platforms Inc.', lastPrice: 292.51, change: -3.22, pChange: -1.09 },
  { symbol: 'TSLA', companyName: 'Tesla Inc.', lastPrice: 237.01, change: 4.89, pChange: 2.11 },
  { symbol: 'NVDA', companyName: 'NVIDIA Corporation', lastPrice: 424.64, change: 7.56, pChange: 1.81 }
];

const MOCK_WATCHLISTS = [
  {
    _id: '1',
    name: 'Tech Giants',
    stocks: MOCK_STOCKS.slice(0, 4)
  },
  {
    _id: '2',
    name: 'Growth Stocks',
    stocks: [MOCK_STOCKS[4], MOCK_STOCKS[5], MOCK_STOCKS[6]]
  }
];

// Generate mock historical data
const generateMockHistoricalData = (days, baseValue, volatility) => {
  const data = [];
  let currentValue = baseValue;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some random movement
    const change = (Math.random() - 0.5) * volatility;
    currentValue = Math.max(0.1, currentValue + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: currentValue
    });
  }
  
  return data;
};

// Generate mock prediction data
const generateMockPredictionData = (stockSymbol, days) => {
  const baseValue = MOCK_STOCKS.find(s => s.symbol === stockSymbol)?.price || 100;
  const historicalData = generateMockHistoricalData(30, baseValue, baseValue * 0.03);
  
  const dates = historicalData.map(d => d.date);
  const actual = historicalData.map(d => d.value);
  
  // Add future dates for prediction
  const lastDate = new Date(dates[dates.length - 1]);
  for (let i = 1; i <= days; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    dates.push(nextDate.toISOString().split('T')[0]);
  }
  
  // Generate predicted values (continuing the pattern with some randomness)
  const predicted = [...actual];
  const trend = (predicted[predicted.length - 1] - predicted[predicted.length - 10]) / 10;
  
  for (let i = 0; i < days; i++) {
    const lastValue = predicted[predicted.length - 1];
    const randomFactor = (Math.random() - 0.4) * (baseValue * 0.015);  // Slightly biased towards up
    const nextValue = lastValue + trend + randomFactor;
    predicted.push(Math.max(0.1, nextValue));
  }
  
  // Generate confidence intervals
  const confidenceLow = predicted.map(v => v * 0.95);
  const confidenceHigh = predicted.map(v => v * 1.05);
  
  return {
    dates,
    actual: actual.concat(Array(days).fill(null)),
    predicted,
    confidenceLow,
    confidenceHigh
  };
};

// Mock stock details
const getStockDetail = (symbol) => {
  const stockData = MOCK_STOCKS.find(s => s.symbol === symbol);
  if (!stockData) {
    throw new Error(`Stock with symbol ${symbol} not found`);
  }
  
  return {
    ...stockData,
    exchange: 'NASDAQ',
    marketCap: Math.random() * 2000 + 100, // Billions
    peRatio: Math.random() * 30 + 10,
    volume: Math.floor(Math.random() * 50000000) + 1000000,
    high52Week: stockData.price * (1 + Math.random() * 0.3),
    low52Week: stockData.price * (1 - Math.random() * 0.3),
    description: `${stockData.name} is a leading technology company specializing in innovative products and services.`
  };
};



const StockContext = createContext(undefined);

export const StockProvider = ({ children }) => {

  const server = `http://localhost:5000/api`
  const [watchlists, setWatchlists] = useState(MOCK_WATCHLISTS);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [predictionHorizon, setPredictionHorizon] = useState(7);
  const [stockData, setStockData] = useState([]);
  const [predictionData, setPredictionData] = useState(null);

  const { user } = useAuth();

  useEffect( () => {
    if (user) {
      fetchWatchLists(user._id)
    }
  }, [user])
  
  const fetchWatchLists = async (userId)=>{
    try {
        const response = await axios.post(`${server}/watchlist/getwatchlists`, {userId: userId})
        const lists = response.data.watchlists
        setWatchlists([])
      setWatchlists([...lists]);
     // console.log(lists[0]);
        //setSelectedWatchlist(lists);
      } catch (e) {
       // console.log(e);
      }
  }

  const createWatchlist = async (name, userId) => {
    try {
      const response = await axios.post(`${server}/watchlist/create`, { name: name, userId: userId });
      const newWatchlist = response.data.watchlist;
      setWatchlists([...watchlists, newWatchlist]);
      toast.success(`Created new watchlist: ${name}`);
    } catch (err) {
      //console.log(err);
      toast.error(`Error Occured: ${err}`);
    }
    
  };

  const deleteWatchlist = async (id) => {
    try {
      const response = await axios.post(`${server}/watchlist/delete_watchlist`, { watchlistId: id })
     // console.log(id);
     // console.log(response.data)
      
      toast.success('Watchlist deleted');
      
      setSelectedWatchlist(null);
      setWatchlists([])
      fetchWatchLists(user._id);

      

    } catch (err) {
      //console.log(err);
    }
  };

  const addToWatchlist = async (watchlistId, stock) => {

    try {
      const response = await axios.post(`${server}/watchlist/append`, { watchlistId: watchlistId, stockId: stock._id });
     

      const response2 = await axios.post(`${server}/watchlist/getlist`, { watchlistId: watchlistId });
      
      const watchlist = response2.data;
      setSelectedWatchlist(watchlist);
      
      toast.success(`Added ${stock.symbol} to ${watchlist.name}`);
    } catch (e) {
      //console.log(e);
    } 
  };

  const removeFromWatchlist = async (watchlistId, stock) => {
    try {
      //console.log(stock)
      const response = await axios.post(`${server}/watchlist/delete_from_watchlist`, { watchlistId: watchlistId, stockId: stock.stockId });
      toast.success(`Removed ${stock.companyName} from watchlist`);

      const response2 = await axios.post(`${server}/watchlist/getlist`, { watchlistId: watchlistId });
      
      const watchlist = response2.data;
      setSelectedWatchlist(watchlist);
      return watchlist;

    } catch (err) {
     // console.log(err);
    }
    
  };

  const searchStocks = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${server}/stock/search`, { query });

     // console.log("Search API Response:", response.data.results);
      
      setSearchResults(response.data.results);  // ✅ Update state immediately
      return response.data.results;

    } catch (err) {
      console.error("Search Error:", err);
      setSearchResults([]); // Ensure state updates on error
      return [];
    } finally {
      setIsLoading(false);
    }
  };


  const selectStock = async (symbol) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stockDetail = getStockDetail(symbol);
      setSelectedStock(stockDetail);
      
      // Get historical data based on timeframe
      let days = 30;
      switch (selectedTimeframe) {
        case '1D': days = 1; break;
        case '1W': days = 7; break;
        case '1M': days = 30; break;
        case '3M': days = 90; break;
        case '1Y': days = 365; break;
      }
      
      const historicalData = generateMockHistoricalData(days, stockDetail.price, stockDetail.price * 0.02);
      setStockData(historicalData);
      
      // Get prediction data
      const prediction = generateMockPredictionData(symbol, predictionHorizon);
      setPredictionData(prediction);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      toast.error('Failed to load stock details');
    } finally {
      setIsLoading(false);
    }
  };

  const setTimeframe = (timeframe) => {
    setSelectedTimeframe(timeframe);
    if (selectedStock) {
      selectStock(selectedStock.symbol);
    }
  };

  const refreshPrediction = async () => {
    if (!selectedStock) return;
    
    setIsLoading(true);
    toast.info(`Refreshing prediction for ${selectedStock.symbol}...`);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const prediction = generateMockPredictionData(selectedStock.symbol, predictionHorizon);
      setPredictionData(prediction);
      toast.success('Prediction refreshed with latest data');
    } catch (error) {
      console.error('Error refreshing prediction:', error);
      toast.error('Failed to refresh prediction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StockContext.Provider value={{
      watchlists,
      selectedWatchlist,
      searchResults,
      isLoading,
      selectedStock,
      selectedTimeframe,
      predictionHorizon,
      stockData,
      predictionData,
      setSearchResults,
      setSelectedWatchlist,
      createWatchlist,
      deleteWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      searchStocks,
      selectStock,
      setTimeframe,
      setPredictionHorizon,
      refreshPrediction
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
