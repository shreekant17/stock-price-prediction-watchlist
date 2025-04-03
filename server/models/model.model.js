import mongoose from "mongoose";
const ModelSchema = new mongoose.Schema(
    {
        stock_symbol: { type: String, unique: true, required: true }, // Unique symbol with ".NS" for NSE

        accuracy: { type: Number, default: undefined },

        model: { type: JSON },

        end_date: { type: String },

        weights: { type: Array }

    },
    { strict: false } // Allows storing additional fields dynamically
);

export const Model = mongoose.model("Model", ModelSchema);