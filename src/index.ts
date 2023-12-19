import express, { Express } from 'express';
import dotenv from 'dotenv';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';

import { bot } from './core/telegram';
import { prisma } from './core/prisma';
import { initBot } from './services/telegram.service';
import { findNewFlats } from './controllers/notify.controller';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/notify', findNewFlats);

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});

bot.start();
initBot(bot);
prisma.$connect();
