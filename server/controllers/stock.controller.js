

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

        // Search by symbol, name, or meta.companyName using regex
        const regexPattern = new RegExp(query, "i");
        const matchedStocks = await Stock.find({
            $or: [
                { symbol: { $regex: regexPattern } },
                { name: { $regex: regexPattern } },
                { "meta.companyName": { $regex: regexPattern } }
            ]
        }, {
            symbol: 1,
            "meta.companyName": 1,
            lastPrice: 1,
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
