import { useState } from 'react';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, ShipWheel, LoaderCircle, ChartBarIncreasing, ChartCandlestick } from 'lucide-react';
import { useStock } from '@/context/StockContext';
import axios from "axios"
import { toast } from 'sonner';


const WatchlistTable = () => {


  const server = `https://stock-prediction-two-roan.vercel.app/api`
  const { selectedWatchlist, removeFromWatchlist, selectStock, setSelectedStock, setSelectedWatchlist } = useStock();

  const [predictedPrice, setPredictedPrice] = useState("----")

  if (!selectedWatchlist || selectedWatchlist.stocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground mb-4">
          {!selectedWatchlist
            ? 'Select or create a watchlist to get started'
            : 'No stocks in this watchlist yet'}
        </p>
        {selectedWatchlist && (
          <p className="text-sm text-muted-foreground">
            Use the search bar above to find and add stocks to your watchlist
          </p>
        )}
      </div>
    );
  }

  const handleClick = async function (stock) {
    
    
    setSelectedWatchlist((prevWatchlist) => ({
         ...prevWatchlist,
         stocks: prevWatchlist.stocks.map((s) =>
           s.stockId === stock.stockId ? { ...s, prediction_in_progress: true } : s
         ),
    }));
    
    const requestSent = await getPredictions(stock);


    if (!requestSent) {
      
      setSelectedWatchlist((prevWatchlist) => ({
         ...prevWatchlist,
         stocks: prevWatchlist.stocks.map((s) =>
           s.stockId === stock.stockId ? { ...s, prediction_in_progress: false } : s
         ),
       }));
    }
    
    
    
  };

  const getPredictions = async (stock) => {

    try {

      const response = await axios.post(`${server}/stock/getPredictions`, { symbol: stock.symbol });

      console.log(response);

      if (response.data.another_prediction_in_progress) {
        toast.error(`Another prediction in progress`);
        return false;
      } else {
        
        const newStock = response.data.stock
      //const accuracy = response.data.accuracy
      
  
        setSelectedWatchlist((prevWatchlist) => ({
          ...prevWatchlist,
          stocks: prevWatchlist.stocks.map((s) =>
            s.stockId === stock.stockId ? { ...newStock } : s
          ),
        }));
        return true;
      }


    } catch (err) {
      console.log(err);
    }
  }

  

  const renderPriceChange = (stock) => {
    const isPositive = stock.pChange >= 0;
    const color = isPositive ? 'text-stocksense-positive' : 'text-stocksense-negative';
    const sign = isPositive ? '+' : '';

    return (
      <div className={`flex flex-col ${color}`}>
        <span>₹{stock.price.toFixed(2)}</span>
        <span className="text-xs">
          {sign}{stock.pChange.toFixed(2)}% ({sign}₹{stock.change.toFixed(2)})
        </span>
      </div>
    );
  };


  const renderAccuracy = (accuracy) => {
    const isPositive = accuracy >= 75;
    const color = isPositive ? 'text-stocksense-positive' : 'text-stocksense-negative';
  

    return (
      <div className={`flex flex-col ${color}`}>
        <span>{accuracy.toFixed(2)}%</span>
        
      </div>
    );
  };


  const renderPredictionPrice = (prev, next) => {
    const isPositive = next > prev;
    const color = isPositive ? 'text-stocksense-positive' : 'text-stocksense-negative';
    const sign = isPositive ? '+' : '';

    return (
      <div className={`flex flex-col ${color}`}>
        <span>₹{next.toFixed(2)}</span>
        <span className="text-xs">
          {sign}{(((next - prev) / prev) * 100).toFixed(2)}% ({sign}₹{(next - prev).toFixed(2)})
        </span>
      </div>
    );
  }



  return (
    <div className="rounded-md border opacity-100">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price / Change</TableHead>
            <TableHead className="text-right">Next Predicted Price</TableHead>
            <TableHead className="text-right">Accuracy</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedWatchlist.stocks.map((stock) => (
            <TableRow key={stock.symbol}>
              <TableCell className="font-medium">{stock.symbol}</TableCell>
              <TableCell>{stock.name}</TableCell>
              <TableCell className="text-right">{renderPriceChange(stock)}</TableCell>
              
              <TableCell className="text-right">
                {
                   stock.prediction_in_progress ? (
                     <div className="text-right">
                      <LoaderCircle className="animate-spin h-4 w-4 inline-block" />
                    </div>
                  ) : stock.nextPrice === undefined ? (
                     "---"
                  ) : typeof stock.nextPrice === "number" ? (
                    renderPredictionPrice(stock.price, stock.nextPrice)
                  ) : (
                    stock.nextPrice
                  )}

              </TableCell>

              <TableCell className="text-right">
                {
                  stock.prediction_in_progress ? (
                  <div className="text-right">
                      <LoaderCircle className="animate-spin h-4 w-4 inline-block" />
                    </div>
                  ) :  stock.accuracy === undefined? (
                  "---"
                  ) : typeof stock.accuracy === "number" ? (
                      renderAccuracy(stock.accuracy)
                  ) : (
                    stock.accuracy
                  )}
              </TableCell>

              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Predict New Price"
                    disabled = {stock.prediction_in_progress}
                    onClick={(e) => handleClick.call(e.currentTarget, stock)}
                  >
                    <ChartCandlestick className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="View Stock"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Remove"
                    
                    onClick={() => removeFromWatchlist(selectedWatchlist._id, stock)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WatchlistTable;
