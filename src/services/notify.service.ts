/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { FlatWithoutTimestamps } from '../core/scraper';
import { bot } from '../core/telegram';
import { prisma } from '../core/prisma';
import { AVITO_URL } from '../core/urls';
import { formatPrice } from '../utils/scrape';
import { isSubwayColor, metroStations, subwayColors } from '../core/subway';
import { AvitoScrapperService } from './avito.service';

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

  for (const flat of diff) {
    try {
      const { title, url, subway, img, timeToSubway, comission, address, price, host } = flat;
      let colors = '';
      const colorsText = metroStations.find((station) => station.name === subway);
      if (colorsText) {
        colors = colorsText.color
          .filter(isSubwayColor)
          .map((color) => subwayColors[color])
          .join('');
      }
      const text = [
        `[${title}](${url}) [[${host.split('.')[0]}]]\n`,
        `${colors} ${subway}`,
        `🚶🏼‍♂️ ${timeToSubway}`,
        `📍 ${address}\n`,
        `*${formatPrice(price, ' руб')}*`,
        `${comission}`,
      ].join('\n');
      await bot.api.sendPhoto(process.env.TELEGRAM_ID as string, img, { parse_mode: 'Markdown', caption: text });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Неизвестная ошибка');
    }
  }
}
