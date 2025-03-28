
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    document.title = 'StockSense - AI-Powered Stock Prediction & Portfolio Dashboard';
  }, []);

  return <Navigate to="/" replace />;
};

export default Index;
