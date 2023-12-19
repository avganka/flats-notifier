import { FlatWithoutTimestamps } from '../core/scraper';
import { bot } from '../core/telegram';
import { prisma } from '../core/prisma';
import { AVITO_URL } from '../core/urls';
import { AvitoScrapperService } from './avito.service';
import { Subscriber } from '@prisma/client';
import { sendFlats } from '../services/telegram.service';

export async function getNewFlats() {
  const avitoScrapeService = new AvitoScrapperService({
    headless: 'new',
    viewport: {
      width: 1200,
      height: 800,
    },
  });
  const avitoFlats = await avitoScrapeService.scrape(AVITO_URL, {
    query: '?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing',
  });

  const count = await prisma.flat.count({
    where: {
      host: 'avito.ru',
    },
  });

  const diff: FlatWithoutTimestamps[] = [];

  for (const flat of avitoFlats) {
    if (count === 0) {
      await prisma.flat.create({ data: flat });
    } else {
      const isInDB = await prisma.flat.findUnique({
        where: {
          id: flat.id,
        },
      });
      if (!isInDB) {
        await prisma.flat.create({ data: flat });
        diff.push(flat);
      }
    }
  }

  const subscribers: Subscriber[] = await prisma.subscriber.findMany();

  for (const flat of diff) {
    await sendFlats(bot, subscribers, flat);
  }
}
