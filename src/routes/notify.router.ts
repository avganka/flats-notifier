import express from 'express';
import { findNewFlats } from '../controllers/notify.controller';

const router = express.Router();

router.get('/notify', findNewFlats);

export default router;
