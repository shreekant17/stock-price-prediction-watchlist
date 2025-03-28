
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Search, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-stocksense-primary" />
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">StockSense</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              AI-Powered Stock Prediction & Analysis
            </h2>
            <p className="max-w-[800px] text-gray-500 md:text-xl">
              Make smarter investment decisions with our AI-driven stock predictions and comprehensive market analysis.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <BarChart3 className="h-8 w-8 text-stocksense-primary" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Predictions</h3>
              <p className="text-gray-500">
                Our advanced machine learning models analyze market data to predict future stock trends with remarkable accuracy.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-8 w-8 text-stocksense-primary" />
              </div>
              <h3 className="text-xl font-bold">Portfolio Management</h3>
              <p className="text-gray-500">
                Track and manage your investments with customizable watchlists and real-time market data.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Search className="h-8 w-8 text-stocksense-primary" />
              </div>
              <h3 className="text-xl font-bold">Stock Analysis</h3>
              <p className="text-gray-500">
                Get in-depth analysis of any stock, including key metrics, historical performance, and future projections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stocksense-primary py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center text-white">
            <ShieldCheck className="h-12 w-12" />
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Start making smarter investment decisions today
            </h2>
            <p className="max-w-[600px] text-white/80">
              Join thousands of traders who've improved their portfolio performance with StockSense.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-stocksense-primary" />
              <span className="font-bold">StockSense</span>
            </div>
            <p className="text-center text-sm text-gray-500 md:text-left">
              © 2025 StockSense. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="text-sm text-gray-500 hover:underline">Terms</Link>
              <Link to="/privacy" className="text-sm text-gray-500 hover:underline">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
