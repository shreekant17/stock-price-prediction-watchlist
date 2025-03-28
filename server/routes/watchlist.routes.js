import { Router } from 'express';

import { appendList, create, getwatchlists, getlist, delete_from_watchlist, delete_watchlist } from "../controllers/watchlist.controller.js"

const router = Router();


router.post('/append', appendList);

router.post('/create', create);

router.post('/getlist', getlist);

router.post('/getwatchlists', getwatchlists);
router.post('/delete_from_watchlist', delete_from_watchlist);
router.post('/delete_watchlist', delete_watchlist);

export default router;