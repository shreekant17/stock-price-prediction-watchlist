import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useStock } from '@/context/StockContext';
import { NseIndia } from "stock-nse-india";
import axios from 'axios';

const fastserver = `https://shreekantkalwar-stock-prediction-model.hf.space`

const fetchPredictionData = async (symbol) => {
  const response = await axios.post(`${fastserver}/train`, {
          stock_symbol: symbol,
          start_date: startDate.toISOString().split('T')[0], 
           end_date: new Date().toISOString().split('T')[0],
          future_days: 30
      });
  return response.data();
};

const StockChart = () => {

  const nse = new NseIndia();

  const { selectedStock } = useStock();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedStock) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 10);

        var start = startDate.toISOString().split('T')[0]
        var end = new Date().toISOString().split('T')[0]
        
        const historicalData = await axios.post({ symbol: selectedStock.symbol, range:{start, end}  });
        const predictionData = await fetchPredictionData(selectedStock.symbol);

        const mergedData = [
          ...historicalData.map(d => ({ date: d.date, value: d.value, type: 'actual' })),
          ...predictionData.map(d => ({ date: d.date, value: d.predicted, type: 'predicted' }))
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
      <CardHeader>
        <CardTitle>{selectedStock?.symbol || 'Stock Chart'}</CardTitle>
        <Button onClick={() => setData([])} disabled={loading}>
          {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area dataKey="value" fill="#2563EB" stroke="#2563EB" />
            <Line dataKey="value" stroke="#10B981" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StockChart;
