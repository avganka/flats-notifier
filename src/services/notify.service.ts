import { Flat, ScrapeService } from './scrape';
import differenceBy from 'lodash/differenceBy';
import { bot } from './telegram';
import { prisma } from './prisma';

export async function getNewFlats() {
  const URL =
    // eslint-disable-next-line max-len
    'https://www.avito.ru/sankt-peterburg/kvartiry/sdam/na_dlitelnyy_srok/do-30-tis-rubley-ASgBAgECAkSSA8gQ8AeQUgFFxpoMFXsiZnJvbSI6MCwidG8iOjMwMDAwfQ?f=ASgBAgECA0SSA8gQ8AeQUswIjlkBRcaaDBV7ImZyb20iOjAsInRvIjozMDAwMH0&footWalkingMetro=20&metro=153-156-158-166-168-169-173-183-185-186-190-192-197-204-207&s=104';
  const avitoScrapeService = new ScrapeService('avito.ru', {
    headless: 'new',
  });
  const flats = await avitoScrapeService.scrape(URL, {
    adSel: 'div[data-marker="item"]',
    idSel: 'data-item-id',
    titleSel: 'h3[itemprop="name"]',
    subwaySel: '[data-marker="item-address"]>div>p:nth-child(2)>span:nth-child(2)',
    imgSel: '[data-marker="item-photo"] [itemprop="image"]',
    urlSel: 'a[itemprop="url"]',
  });

  if (flats) {
    const oldFlats: Flat[] = await prisma.avitoFlat.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        url: true,
        img: true,
        subway: true,
      },
      take: 20,
    });

    const lastsFlats = flats.slice(0, 20);

    const diff = differenceBy(lastsFlats, oldFlats, 'id');

    for (const flat of diff) {
      try {
        await prisma.avitoFlat.create({ data: flat });
        const { title, url, subway } = flat;
        const text = `${title} - ${subway}\n${url}`;
        await bot.api.sendMessage(process.env.TELEGRAM_ID as string, text);
      } catch (error) {
        console.log(flat);
      }
    }
  }
}
