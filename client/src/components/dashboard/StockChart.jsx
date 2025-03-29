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

  useEffect(() => {
    if (!selectedStock) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        
        const start = startDate.toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];
        
        const historicalData = await axios.post(`${server}/stock/getHistoricalData`, {
          symbol: selectedStock.symbol,
          range: { start, end }
        });
        
        const predictionData = await fetchPredictionData(selectedStock.symbol);

        const mergedData = [
          ...historicalData.data.response.map(d => ({ date: d.date, value: d.value, type: 'actual' })),
          ...predictionData.future_predictions.map(d => ({ date: d.date, value: d.predicted, type: 'predicted' }))
        ];

        setData(mergedData);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedStock]);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{selectedStock?.symbol || 'Stock Chart'}</CardTitle>
        <Button onClick={() => setData([])} disabled={loading}>
          {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} className="stock-chart-grid">
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area dataKey="value" stroke="#2563EB" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} name="Actual" />
            <Line dataKey="value" stroke="#10B981" dot={false} strokeWidth={2} name="Predicted" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StockChart;
