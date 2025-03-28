import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
    name: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stocks: [
        {
            stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
            addedAt: { type: Date, default: Date.now }
        }
    ]
});

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);

