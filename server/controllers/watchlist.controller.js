
import { Watchlist } from "../models/watchlist.model.js"

export const create = async (req, res) => {
    const watchlist = {
        name: req.body.name,
        userId: req.body.userId,
        stocks: [],
    }
    try {

        const newWatchlist = await Watchlist.create(watchlist);
        return res.status(200).json({ message: "Watchlist Created", watchlist: newWatchlist });

    } catch (err) {
        //  console.log(err);
        return res.status(201).json({ message: "Watchlist Creation Failed" });
    }

}

export const appendList = async (req, res) => {
    try {
        const { watchlistId, stockId } = req.body;

        if (!watchlistId || !stockId) {
            return res.status(400).json({ message: "Watchlist ID and Stock ID are required" });
        }

        let watchlist = await Watchlist.findById(watchlistId);

        if (watchlist) {

            const stockExists = watchlist.stocks.some(stock => stock.stockId.toString() === stockId);
            if (stockExists) {
                return res.status(400).json({ message: "Stock is already in the watchlist" });
            }
            watchlist.stocks.push({ stockId });
            await watchlist.save();
        } else {

            return res.status(200).json({ message: "Something went wrong", watchlist });
        }

        return res.status(200).json({ message: "Stock added successfully", watchlist });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}


export const getlist = async (req, res) => {
    try {
        const { watchlistId } = req.body;

        if (!watchlistId) {
            return res.status(400).json({ message: "Watchlist ID is required" });
        }

        const watchlist = await Watchlist.findOne({ _id: watchlistId })
            .populate({
                path: "stocks.stockId",
                select: "symbol name price change pChange nextPrice peRatio high52Week low52Week marketCap accuracy prediction_in_progress future_predictions"
            });

        if (!watchlist) {
            return res.status(404).json({ message: "Watchlist not found" });
        }

        return res.status(200).json({
            _id: watchlist._id,
            userId: watchlist.userId,
            name: watchlist.name,
            stocks: watchlist.stocks.map(stock => ({
                stockId: stock.stockId._id,
                symbol: stock.stockId.symbol,
                name: stock.stockId.name,
                price: stock.stockId.price,
                peRatio: stock.stockId.peRatio,
                high52Week: stock.stockId.high52Week,
                low52Week: stock.stockId.low52Week,
                change: stock.stockId.change,
                pChange: stock.stockId.pChange,
                nextPrice: stock.stockId.nextPrice,
                marketCap: stock.stockId.marketCap,
                accuracy: stock.stockId.accuracy,
                prediction_in_progress: stock.stockId.prediction_in_progress,
                future_predictions: stock.stockId.future_predictions
            }))
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}


export const getwatchlists = async (req, res) => {
    try {
        const userId = req.body.userId;
        const watchlists = await Watchlist.find({ userId: userId });
        return res.status(200).json({ watchlists });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}


export const delete_watchlist = async (req, res) => {
    try {
        const { watchlistId } = req.body;

        if (!watchlistId) {
            return res.status(400).json({ message: "Watchlist ID is required!" });
        }

        // Use _id instead of watchlistId in the query
        const result = await Watchlist.deleteOne({ _id: watchlistId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Watchlist not found!" });
        }

        return res.status(200).json({ message: "Watchlist deleted successfully!" });

    } catch (err) {
        console.error("Error deleting watchlist:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const delete_from_watchlist = async (req, res) => {
    try {
        const { watchlistId, stockId } = req.body;

        let watchlist = await Watchlist.findById(watchlistId);

        if (!watchlist) {
            return res.status(404).json({ message: "Watchlist not found" });
        }

        // Check if stock exists in the watchlist
        const stockExists = watchlist.stocks.some(stock => stock.stockId.toString() === stockId);
        if (!stockExists) {
            return res.status(400).json({ message: "Stock is not in the watchlist" });
        }

        // Remove stock using filter
        watchlist.stocks = watchlist.stocks.filter(stock => stock.stockId.toString() !== stockId);
        await watchlist.save();

        return res.status(200).json({ message: "Stock removed successfully", watchlist });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
