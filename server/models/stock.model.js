import mongoose from "mongoose";
const StockSchema = new mongoose.Schema(
    {
        symbol: { type: String, unique: true, required: true }, // Unique symbol with ".NS" for NSE
        name: { type: String, required: true },
        exchange: { type: String, default: "NSE" },
        price: { type: Number },
        change: { type: Number },
        pChange: { type: Number },
        nextPrice: { type: Number, default: undefined },
        accuracy: { type: Number, default: undefined }
    },
    { strict: false } // Allows storing additional fields dynamically
);

export const Stock = mongoose.model("Stock", StockSchema);

