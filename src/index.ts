import express, { Express } from 'express';
import dotenv from 'dotenv';
import notifyRouter from './routes/notify.router';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';

import { bot } from './core/telegram';
import { prisma } from './core/prisma';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', notifyRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.start();
prisma.$connect();
