
import { NseIndia } from "stock-nse-india";
import axios from "axios"
import { Stock } from "../models/stock.model.js"

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
            _id: 1
        });

        return res.json({ results: matchedStocks });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


export const insert_predicted_price = async (req, res) => {
    try {
        const { stockId, watchlistId, nextPrice } = req.body;

        // Validate input
        if (!stockId || !nextPrice) {
            return res.status(400).json({ error: "Stock ID and next price are required" });
        }

        // Update stock with the predicted price
        const updatedStock = await Stock.findByIdAndUpdate(
            stockId,
            { $set: { nextPrice } },
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
        const symbols = await nse.getAllStockSymbols(); // Get all stock symbols from NSE

        // Fetch all stock details in parallel
        const stockDetails = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const x = await nse.getEquityDetails(symbol);
                    console.log(x.info.symbol + " Done");
                    return {
                        name: x.info.companyName,
                        symbol: x.info.symbol + ".NS",
                        price: x.priceInfo.lastPrice,
                        change: x.priceInfo.change,
                        pChange: x.priceInfo.pChange,
                    };
                } catch (error) {
                    console.error(`Error fetching details for ${symbol}:`, error);
                    return null; // Skip failed fetches
                }
            })
        );

        // Filter out any failed fetches (null values)
        const stocks = stockDetails.filter(stock => stock !== null);

        if (stocks.length === 0) {
            return res.status(400).json({ message: "No valid stock data fetched" });
        }

        // Prepare bulk operations for upsert (insert/update)
        const bulkOps = stocks.map(stock => ({
            updateOne: {
                filter: { symbol: stock.symbol }, // Match by stock symbol
                update: { $set: stock }, // Update the stock data
                upsert: true // Insert if it doesn't exist
            }
        }));

        // Perform bulk insert/update
        await Stock.bulkWrite(bulkOps);

        res.status(200).json({ message: "Fetched and updated NSE stocks", stocks });
    } catch (err) {
        console.error("Error fetching all NSE symbols:", err);
        res.status(500).json({ message: "Error fetching all NSE symbols", error: err.message });
    }
};


export const getHistoricalData = async (req, res) => {
    try {
        const nse = new NseIndia()
        const { symbol, range } = req.body;
        const response = await nse.getEquityHistoricalData(symbol, range);
        res.status(200).json({ message: "Historical data received", response });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error Occured", e });
    }
}

