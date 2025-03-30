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


const WatchlistTable = () => {

  const fastserver = `https://shreekantkalwar-stock-prediction-model.hf.space`
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
    this.disabled = true; // Disable the button
    await predictNextPrice(stock); // Call the function normally
    this.disabled = false; // Re-enable after execution
  };

  const predictNextPrice = async (stock) => {
    setPredictedPrice("Loading...");
    try {
     // console.log(selectedWatchlist)
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 10);
      
       setSelectedWatchlist((prevWatchlist) => ({
          ...prevWatchlist,
          stocks: prevWatchlist.stocks.map((s) =>
            s.stockId === stock.stockId ? { ...s, nextPrice: "Predicting..." } : s
          ),
        }));

      const response = await axios.post(`${fastserver}/train`, {
          stock_symbol: stock.symbol,
          start_date: startDate.toISOString().split('T')[0], 
           end_date: new Date().toISOString().split('T')[0],
          future_days: 30
      });
     // console.log(response.data);

      const nextPrice = response.data.predicted_price_today
      
        const response2 = await axios.post(`${server}/stock/insert_predicted_price`, {
        stockId: stock.stockId,
        nextPrice: nextPrice,
        watchlistId: selectedWatchlist._id
      });

      if (response.status === 200) {
        // Update the state by mapping over selectedWatchlist.stocks
        setSelectedWatchlist((prevWatchlist) => ({
          ...prevWatchlist,
          stocks: prevWatchlist.stocks.map((s) =>
            s.stockId === stock.stockId ? { ...s, nextPrice: nextPrice } : s
          ),
        }));
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
                {stock.nextPrice === undefined ? (
                    "---"
                  ) : stock.nextPrice === "Predicting..." ? (
                    <div className="text-right">
                      <LoaderCircle className="animate-spin h-4 w-4 inline-block" />
                    </div>
                  ) : typeof stock.nextPrice === "number" ? (
                    renderPredictionPrice(stock.price, stock.nextPrice)
                  ) : (
                    stock.nextPrice
                  )}

              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Predict New Price"
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
                    title = "Remove"
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
