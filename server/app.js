import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import stockRoutes from './routes/stock.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';

const app = express();

// Explicitly allow frontend origin
const allowedOrigins = ['https://stock-price-prediction-two.vercel.app', 'http://localhost:8080'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server Running OK");
});

app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/watchlist', watchlistRoutes);

export default app;
