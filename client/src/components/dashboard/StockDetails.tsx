
import React from 'react';
import { useStock } from '@/context/StockContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, CircleDollarSign, BarChart3, TrendingUp } from 'lucide-react';

const StockDetails: React.FC = () => {
  const { selectedStock } = useStock();

  if (!selectedStock) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[280px]">
          <p className="text-muted-foreground">Select a stock to view details</p>
        </CardContent>
      </Card>
    );
  }

  const isPositive = selectedStock.changePercent >= 0;
  const changeColor = isPositive ? 'text-stocksense-positive' : 'text-stocksense-negative';
  const ArrowIcon = isPositive ? ArrowUp : ArrowDown;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatWithSuffix = (value: number) => {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Details</CardTitle>
        <CardDescription>{selectedStock.exchange}: {selectedStock.symbol}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold">{formatCurrency(selectedStock.price)}</p>
            </div>
            <div className={`flex items-center ${changeColor}`}>
              <ArrowIcon className="mr-1 h-5 w-5" />
              <div className="text-lg font-medium">
                {isPositive ? '+' : ''}{selectedStock.pChange.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
              </div>
              <p className="font-medium">{formatWithSuffix(selectedStock.marketCap * 1e9)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">P/E Ratio</p>
              </div>
              <p className="font-medium">
                {typeof Number(selectedStock.peRatio) === "number" ? Number(selectedStock.peRatio).toFixed(2) : "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">52W High</p>
              </div>
              <p className="font-medium">{formatCurrency(selectedStock.high52Week)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground rotate-180" />
                <p className="text-sm font-medium text-muted-foreground">52W Low</p>
              </div>
              <p className="font-medium">{formatCurrency(selectedStock.low52Week)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">About</p>
            <p className="text-sm">{selectedStock.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDetails;
