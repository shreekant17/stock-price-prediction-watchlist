import { Router } from 'express';

import { storeStocks, search, insert_predicted_price } from "../controllers/stock.controller.js"

const router = Router();



router.get('/store', storeStocks);

router.post('/search', search);

router.post('/insert_predicted_price', insert_predicted_price);
export default router;