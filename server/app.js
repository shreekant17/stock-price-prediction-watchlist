import express from 'express';
import cors from 'cors';


import authRoutes from './routes/auth.routes.js';
import stockRoutes from './routes/stock.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';



const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server Running OK")
})

app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/watchlist', watchlistRoutes);




export default app;