
import React from 'react';
import SignupForm from '@/components/auth/SignupForm';
import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="mb-8 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-8 w-8 text-stocksense-primary" />
          <span className="text-2xl font-bold">StockSense</span>
        </Link>
        <h1 className="text-2xl font-bold text-center">Create an Account</h1>
        <p className="text-muted-foreground text-center mt-1">Sign up to start using StockSense</p>
      </div>
      <SignupForm />
    </div>
  );
};

export default SignupPage;
