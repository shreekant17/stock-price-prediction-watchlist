
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="mb-8 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-8 w-8 text-stocksense-primary" />
          <span className="text-2xl font-bold">StockSense</span>
        </Link>
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        <p className="text-muted-foreground text-center mt-1">Sign in to your account to continue</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
