
// User types
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Stock data types
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockDetail extends StockData {
  exchange: string;
  marketCap: number;
  peRatio: number;
  volume: number;
  high52Week: number;
  low52Week: number;
  description: string;
}

export interface HistoricalData {
  date: string;
  value: number;
}

export interface PredictionData {
  dates: string[];
  actual: number[];
  predicted: number[];
  confidenceLow?: number[];
  confidenceHigh?: number[];
}

// Watchlist types
export interface Watchlist {
  id: string;
  name: string;
  stocks: StockData[];
}
