import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useStock } from '@/context/StockContext';
import axios from 'axios';

const fastserver = `https://shreekantkalwar-stock-prediction-model.hf.space`;
const server = `https://stock-prediction-two-roan.vercel.app/api`;

const fetchPredictionData = async (symbol) => {
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 10);
  
  const response = await axios.post(`${fastserver}/train`, {
    stock_symbol: symbol,
    start_date: startDate.toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    future_days: 30
  });
  return response.data;
};

const StockChart = () => {
  const { selectedStock } = useStock();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

   const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        
        const start = startDate.toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];

        // Fetch and sort historical data
        const historicalResponse = await axios.post(`${server}/stock/getHistoricalData`, {
          symbol: selectedStock.symbol.split(".")[0],
          range: { start, end }
        });
        const historicalData = historicalResponse.data.data
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Fetch prediction data
        const predictionResponse = await fetchPredictionData(selectedStock.symbol);
        const predictionData = predictionResponse.future_predictions;

        // Get last historical point
        const lastHistoricalPoint = historicalData[historicalData.length - 1];
        const lastHistoricalDate = lastHistoricalPoint.date;
        const lastHistoricalValue = lastHistoricalPoint.price;

        // Process predictions with connection point
        const predicted = predictionData
          .map(d => ({
            date: d.date,
            value: d.price,
            type: 'predicted'
          }))
          .filter(d => new Date(d.date) > new Date(lastHistoricalDate));

        // Add connection bridge
        if (predicted.length > 0) {
          predicted.unshift({
            date: lastHistoricalDate,
            value: lastHistoricalValue,
            type: 'predicted'
          });
        }

        // Merge and sort all data
        const mergedData = [
          ...historicalData.map(d => ({
            date: d.date,
            value: d.price,
            type: 'actual'
          })),
          ...predicted
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        setData(mergedData);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
      setLoading(false);
    };

  useEffect(() => {
    if (!selectedStock) return;

   

    fetchData();
  }, [selectedStock]);

  return (
    <Card className="col-span-3 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{selectedStock?.symbol || 'Stock Chart'}</CardTitle>
        <Button onClick={() => { setData([]); fetchData() }} disabled={loading || !selectedStock} >
          {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit'
              })}
              tick={{
                angle: -45,
                textAnchor: 'end',
                fontSize: 12
              }}
              interval="preserveStartEnd"
              height={60}
              margin={{ bottom: 30 }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value) => [`₹${value.toFixed(2)}`, 'Price']}
            />
            <Legend />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              fill="url(#colorActual)"
              strokeWidth={2}
              name="Historical"
              isAnimationActive={false}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Predicted"
              isAnimationActive={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StockChart;