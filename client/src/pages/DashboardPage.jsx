
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import WatchlistSelector from '@/components/dashboard/WatchlistSelector';
import WatchlistTable from '@/components/dashboard/WatchlistTable';
import StockSearch from '@/components/dashboard/StockSearch';
import StockChart from '@/components/dashboard/StockChart';
import StockDetails from '@/components/dashboard/StockDetails';

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="container px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <WatchlistSelector />
            </div>
            <div>
              <StockSearch />
            </div>
          </div>

          <WatchlistTable />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StockChart />
            <StockDetails />
          </div>
        </div>
      </div>
      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © 2025 StockSense. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
