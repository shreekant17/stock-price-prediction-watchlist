import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, LoaderCircle } from "lucide-react";
import { useStock } from "@/context/StockContext";

const StockSearch = () => {
  const { searchStocks, searchResults, isLoading, selectedWatchlist, addToWatchlist } = useStock();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setShowDropdown(false);
      return;
    }
    
    const debounce = setTimeout(() => {
      searchStocks(searchQuery);
      setShowDropdown(true);
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToWatchlist = (stock) => {
    if (selectedWatchlist) {
      addToWatchlist(selectedWatchlist._id, stock);
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <input
        ref={inputRef}
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchQuery && setShowDropdown(true)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search stocks..."
      />

      {/* Dropdown List */}
      {showDropdown && (
        <div ref={dropdownRef} className="absolute left-0 w-full max-h-[50svh] overflow-y-scroll shadow-md border rounded mt-1 bg-white z-50">
          {isLoading ? (
            <div className="p-2 text-gray-500 flex justify-start items-center">
              <LoaderCircle className="animate-spin h-4 w-4 inline-block" />
              <span className="ml-2">Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((stock, index) => (
              <span
                key={index}
                className="flex justify-between p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setSearchQuery(stock.symbol);
                  setShowDropdown(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{stock.symbol}</span>
                  <span className="text-sm text-gray-500">{stock.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!selectedWatchlist}
                  onMouseDown={(e) => e.stopPropagation()} // Prevent dropdown from closing
                  onClick={() => handleAddToWatchlist(stock)}
                  title={selectedWatchlist ? `Add to ${selectedWatchlist.name}` : "Select a watchlist first"}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </span>
            ))
          ) : (
            <div className="p-2 text-gray-500">No stocks found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;
