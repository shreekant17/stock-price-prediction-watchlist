import { Router } from 'express';

import { storeStocks, search, insert_predicted_price, stock_data, getHistoricalData, getPredictions } from "../controllers/stock.controller.js"

const router = Router();



router.get('/store', storeStocks);

router.post('/search', search);
router.post('/getHistoricalData', getHistoricalData);

router.post('/getPredictions', getPredictions);
router.get('/stock_data', stock_data);


router.post('/insert_predicted_price', insert_predicted_price);
export default router;