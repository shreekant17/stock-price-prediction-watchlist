
import { NseIndia } from "stock-nse-india";
import axios from "axios"
import { Stock } from "../models/stock.model.js"

import { Model } from "../models/model.model.js"

const getNSEStocks = async () => {
    try {
        const response = await axios.get(
            "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500",
            {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://www.nseindia.com"
                }
            }
        );

        return response.data.data.map(stock => ({
            ...stock, // Store all stock data
            symbol: stock.symbol + ".NS" // Append ".NS" for Yahoo Finance compatibility
        }));
    } catch (error) {
        console.error("❌ Error fetching NSE stocks:", error.message);
        return [];
    }
};


export const storeStocks = async (req, res, next) => {

    const nseStocks = await getNSEStocks();
    // console.log(nseStocks)

    for (const stock of nseStocks) {
        await Stock.updateOne(
            { symbol: stock.symbol },
            { $set: stock },  // Store full stock details
            { upsert: true }
        );
    }
    return res.status(200).json({ message: "✅ NSE stocks updated in MongoDB" })

}


export const search = async (req, res) => {
    try {
        const query = req.body.query;
        if (!query) return res.status(400).json({ error: "Query is required" });

        // Search by symbol, name, or name using regex
        const regexPattern = new RegExp(query, "i");
        const matchedStocks = await Stock.find({
            $or: [
                { symbol: { $regex: regexPattern } },
                { name: { $regex: regexPattern } }
            ]
        }, {
            symbol: 1,
            name: 1,
            price: 1,
            change: 1,
            pChange: 1,
            nextPrice: 1,
            peRatio: 1,
            high52Week: 1,
            low52Week: 1,
            marketCap: 1,
            accuracy: 1,
            _id: 1
        });

        return res.json({ results: matchedStocks });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


export const insert_predicted_price = async (req, res) => {
    try {
        const { stockId, watchlistId, nextPrice, accuracy } = req.body;

        // Validate input
        if (!stockId || !nextPrice) {
            return res.status(400).json({ error: "Stock ID and next price are required" });
        }

        // Update stock with the predicted price
        const updatedStock = await Stock.findByIdAndUpdate(
            stockId,
            { $set: { nextPrice, accuracy } },
            { new: true } // Return updated document
        );

        // Check if stock was found and updated
        if (!updatedStock) {
            return res.status(404).json({ error: "Stock not found" });
        }

        return res.status(200).json({ message: "Predicted price added successfully", stock: updatedStock });

    } catch (err) {
        console.error("Error inserting predicted price:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};




export const stock_data = async (req, res) => {
    try {
        const nse = new NseIndia();
        const symbols = await nse.getAllStockSymbols();

        // Process stocks in batches to avoid timeout
        const batchSize = 50; // Adjust batch size based on performance
        const stockDetails = [];

        for (let i = 0; i < symbols.length; i += batchSize) {
            const batch = symbols.slice(i, i + batchSize);
            console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(symbols.length / batchSize)}`);

            const batchResults = await Promise.all(
                batch.map(async (symbol) => {
                    try {
                        const x = await nse.getEquityDetails(symbol);
                        console.log(x.info.symbol + " Done");
                        return {
                            name: x.info.companyName,
                            symbol: x.info.symbol + ".NS",
                            price: x.priceInfo.lastPrice,
                            change: x.priceInfo.change,
                            pChange: x.priceInfo.pChange,
                            peRatio: x.metadata.pdSymbolPe,
                            high52Week: x.priceInfo.weekHighLow.max,
                            low52Week: x.priceInfo.weekHighLow.min,
                            marketCap: x.priceInfo.lastPrice * x.securityInfo.issuedSize,
                            nextPrice: undefined,
                            accuracy: undefined,
                            prediction_in_progress: false
                        };
                    } catch (error) {
                        console.error(`Error fetching details for ${symbol}:`, error);
                        return null; // Skip failed fetches
                    }
                })
            );

            stockDetails.push(...batchResults.filter(stock => stock !== null));
        }

        if (stockDetails.length === 0) {
            return res.status(400).json({ message: "No valid stock data fetched" });
        }

        // Perform bulk insert/update
        const bulkOps = stockDetails.map(stock => ({
            updateOne: {
                filter: { symbol: stock.symbol },
                update: { $set: stock },
                upsert: true
            }
        }));

        await Stock.bulkWrite(bulkOps);
        res.status(200).json({ message: "Fetched and updated NSE stocks", stocks: stockDetails });
    } catch (err) {
        console.error("Error fetching NSE stocks:", err);
        res.status(500).json({ message: "Error fetching NSE stocks", error: err.message });
    }
};



export const getHistoricalData = async (req, res) => {
    try {
        const nse = new NseIndia();
        const { symbol } = req.body;

        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const start_date = getISTDateString(startDate);
        const end_date = getISTDateString(new Date());

        const range = {
            start: start_date,
            end: end_date
        }

        // Fetch historical data from NSE API
        const response = await nse.getEquityHistoricalData(symbol, range);

        // Extract CH_TIMESTAMP and CH_LAST_TRADED_PRICE
        const extractedData = response.flatMap(entry =>
            entry?.data?.map(({ CH_TIMESTAMP, CH_LAST_TRADED_PRICE }) => ({
                date: CH_TIMESTAMP,
                price: CH_LAST_TRADED_PRICE
            })) || []
        );

        // Send the extracted data in response
        res.status(200).json({ message: "Historical data received", data: extractedData });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error Occurred", error: e.message });
    }
};


function getISTDateString(date) {
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('en-CA', options).format(date); // 'en-CA' gives YYYY-MM-DD format
}

export const getPredictions = async (req, res) => {
    try {
        const { symbol } = req.body;

        if (!symbol) {
            return res.status(400).json({ error: 'Stock symbol is required' });
        }



        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 10);
        const start_date = getISTDateString(startDate);
        const end_date = getISTDateString(new Date());

        // Check if the model data already exists
        const model = await Model.findOne({ stock_symbol: symbol, end_date });



        if (model) {
            // Wait for the response before sending back
            const stock = await Stock.findOne({ symbol: symbol })
            return res.status(200).json({ message: "Predictions Received", stock, modelExists: true });

        } else {
            const pending_prediction = await Stock.findOne({ prediction_in_progress: true });
            if (pending_prediction) {
                return res.status(202).json({ message: 'Another prediction in progress.', another_prediction_in_progress: true });
            }
            // Send response immediately
            const updatedStock = await Stock.findOneAndUpdate(
                { symbol: symbol },
                { $set: { prediction_in_progress: true } },
                { new: true } // Return updated document
            );

            // Fire-and-forget API call (No await, runs in the background)
            axios.post(`https://shreekantkalwar-stock-prediction-model.hf.space/train`, {
                stock_symbol: symbol,
                start_date,
                end_date,  // Fixed incorrect usage
                future_days: 30
            }).catch(err => console.error("Error in background API call:", err.message));

            res.status(202).json({ message: 'Prediction request sent to the model.', stock: updatedStock, modelExists: false, another_prediction_in_progress: false });
        }

    } catch (err) {
        console.error('Unexpected error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
