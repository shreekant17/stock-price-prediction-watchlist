import React, { useState } from 'react'

import  axios  from 'axios';
import { ul } from 'framer-motion/client';
export const AdminPage = () => {
    const [currBatch, setCurrBatch] = useState([]);
    const [allStocks, setAllStocks] = useState([]);
    const handleUpdateStocksData = async () => {
        try {
            
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/stock/stock_symbols`);
            const symbols = response.data.symbols;
            console.log(symbols);

            const batchSize = 50; // Adjust batch size based on performance
           

            for (let i = 0; i < symbols.length; i += batchSize) {
                const batch = symbols.slice(i, i + batchSize);
                setCurrBatch(batch);
                console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(symbols.length / batchSize)}`);
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/stock/stock_data`, 
                    { symbols: batch },
                    { headers: { "Content-Type": "application/json" } }
                );
                
                console.log(response.data.stocks)
                setAllStocks(prev => [...prev, ...batch]);
                setCurrBatch(['All Done'])
            }
           
        } catch (err) {
            console.log(err);
        }
    } 
    return (
     
     
      <div className="min-h-screen flex flex-col">
              
      
      <div className="container px-4 py-8 flex-grow">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                <button onPress={handleUpdateStocksData} >Say Hello</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p>Completed</p>
                        <p className='text-justify'>{ allStocks.join(", ")}</p>
                        {/* <ul>
                        {allStocks.map((stock, index) => (
                                <li key={index}>{stock}</li>
                            ))}
                            </ul> */}
                    </div>
                    <div>
                        <p>Current Batch</p>
                        <p className='text-justify'>{ currBatch.join(", ")}</p>
                         {/* <ul>
                        {currBatch.map((stock, index) => (
                                <li key={index}>{stock}</li>
                            ))}
                            </ul> */}
                    </div>
                </div>
        </div>
      </div>
                
  )
}
