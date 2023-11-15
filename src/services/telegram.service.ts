import { prisma } from '../core/prisma';
import { Api, Bot, Context, RawApi } from 'grammy';

export const initBot = (bot: Bot<Context, Api<RawApi>>) => {
  bot.command('start', async (ctx) => {
    const chatId = ctx.msg.chat.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await prisma.subscriber.create({ data: { telegramId: chatId } });
    ctx.reply('Вы подписались на уведомления');
  });
};
