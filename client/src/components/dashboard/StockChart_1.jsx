
import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Line,
  ComposedChart, 
  Legend,
  Label
} from 'recharts';
import { useStock } from '@/context/StockContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';


const formatCurrency = (value) => {
  return `$${value.toFixed(2)}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="stock-chart-tooltip">
        <p className="font-medium">{label ? formatDate(label) : ''}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StockHistoricalChart = ({ historicalData }) => {
  // Format data for the chart
  const formattedData = historicalData.map((entry) => ({
    date: new Date(entry.CH_TIMESTAMP).toLocaleDateString(),
    value: entry.CH_CLOSING_PRICE,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};



const StockPredictionChart = ({ data }) => {
  // Find the index where actual data ends and prediction begins
  const predictionStartIndex = data.actual.findIndex(val => val === null);

  const chartData = data.dates.map((date, index) => ({
    date,
    actual: data.actual[index],
    predicted: data.predicted[index],
    confidenceLow: data.confidenceLow?.[index],
    confidenceHigh: data.confidenceHigh?.[index],
    // Mark the data point whether it's a prediction or actual data
    isPrediction: index >= predictionStartIndex - 1 // Include the last actual point
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} className="stock-chart-grid">
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          tickMargin={10}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          domain={['auto', 'auto']} 
          tickFormatter={formatCurrency}
          tickMargin={10}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Confidence Interval Area */}
        {data.confidenceLow && data.confidenceHigh && (
          <Area 
            type="monotone" 
            dataKey="confidenceHigh" 
            fillOpacity={0.2}
            stroke="none"
            fill="url(#colorConfidence)" 
            legendType="none"
          />
        )}
        
        {/* Actual Data Line */}
        <Area 
          type="monotone" 
          dataKey="actual" 
          stroke="#2563EB" 
          fillOpacity={1} 
          fill="url(#colorActual)" 
          strokeWidth={2}
          name="Actual"
          activeDot={{ r: 6 }}
        />
        
        {/* Prediction Line */}
        <Line 
          type="monotone" 
          dataKey="predicted"
          stroke="#10B981" 
          strokeWidth={2}
          name="Prediction"
          dot={false}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const TimeframeSelector = () => {
  const { selectedTimeframe, setTimeframe } = useStock();
  
  const timeframes = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
  ]
  
  return (
    <div className="flex space-x-1">
      {timeframes.map((tf) => (
        <Button
          key={tf.value}
          variant={selectedTimeframe === tf.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeframe(tf.value)}
          className="px-3"
        >
          {tf.label}
        </Button>
      ))}
    </div>
  );
};

const PredictionHorizonSelector = () => {
  const { predictionHorizon, setPredictionHorizon } = useStock();
  
  const horizons = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
  ]
  
  return (
    <div className="flex space-x-1">
      {horizons.map((h) => (
        <Button
          key={h.value}
          variant={predictionHorizon === h.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPredictionHorizon(h.value)}
          className="px-3"
        >
          {h.label}
        </Button>
      ))}
    </div>
  );
};

const StockChart = () => {
  const { 
    selectedStock, 
    stockData, 
    predictionData,
    isLoading,
    refreshPrediction,
  } = useStock();

  if (!selectedStock) {
    return (
      <Card className="col-span-3 lg:col-span-2">
        <CardHeader>
          <CardTitle>Stock Chart</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Select a stock to view its chart</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            {selectedStock.symbol} 
            <span className="text-muted-foreground ml-2 text-sm">
              {selectedStock.name}
            </span>
          </CardTitle>
        </div>
        <div className="flex space-x-4">
          <TimeframeSelector />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPrediction}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {predictionData ? (
              <>
                <div className="mb-4">
                  <StockPredictionChart data={predictionData} />
                </div>
                <div className="flex justify-between items-center">
                  <PredictionHorizonSelector />
                  <div className="text-sm text-muted-foreground">
                    Showing prediction with {predictionHorizon} day horizon
                  </div>
                </div>
              </>
            ) : (
              stockData.length > 0 && <StockHistoricalChart data={stockData} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StockChart;
