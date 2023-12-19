import { Flat, Subscriber } from '@prisma/client';
import { prisma } from '../core/prisma';
import { Api, Bot, Context, RawApi } from 'grammy';

import { isSubwayColor, metroStations, subwayColors } from '../core/subway';
import { formatPrice } from '../utils/scrape';
import { FlatWithoutTimestamps } from '../core/scraper';

export const initBot = (bot: Bot<Context, Api<RawApi>>) => {
  bot.command('start', async (ctx) => {
    const chatId = ctx.msg.chat.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await prisma.subscriber.create({ data: { telegramId: chatId } });
    ctx.reply('Вы подписались на уведомления');
  });
};

export const sendFlats = async (
  bot: Bot<Context, Api<RawApi>>,
  subscribersList: Subscriber[],
  flat: Flat | FlatWithoutTimestamps,
) => {
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

    const subscribers: Subscriber[] = await prisma.subscriber.findMany();

    const text = [
      `[${title}](${url}) [[${host.split('.')[0]}]]\n`,
      `${colors} ${subway}`,
      `🚶🏼‍♂️ ${timeToSubway}`,
      `📍 ${address}\n`,
      `*${formatPrice(price, ' руб')}*`,
      `${comission}`,
    ].join('\n');

    for (const subscriber of subscribers) {
      const { telegramId } = subscriber;
      await bot.api.sendPhoto(telegramId, img, { parse_mode: 'Markdown', caption: text });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Неизвестная ошибка');
  }
};
