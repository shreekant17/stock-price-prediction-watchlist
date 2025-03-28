import mongoose from "mongoose";
const StockSchema = new mongoose.Schema(
    {
        symbol: { type: String, unique: true, required: true }, // Unique symbol with ".NS" for NSE
        name: { type: String, required: true },
        exchange: { type: String, default: "NSE" },
        nextPrice: { type: Number, default: null },
        sector: { type: String, default: null },
        industry: { type: String, default: null },
        marketCap: { type: Number, default: null },
        currentPrice: { type: Number, default: null },
        previousClose: { type: Number, default: null },
        openPrice: { type: Number, default: null },
        dayHigh: { type: Number, default: null },
        dayLow: { type: Number, default: null },
        fiftyTwoWeekHigh: { type: Number, default: null },
        fiftyTwoWeekLow: { type: Number, default: null },
        volume: { type: Number, default: null },
        logo: { type: String, default: null },
        lastUpdated: { type: Date, default: Date.now }, // Store last update timestamp
        extraData: { type: mongoose.Schema.Types.Mixed } // Store any extra fields NSE provides

    },
    { strict: false } // Allows storing additional fields dynamically
);

export const Stock = mongoose.model("Stock", StockSchema);

