import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const prisma = new PrismaClient();

console.log('KRAM Telegram Bot is running...');

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Вітаємо у KRAM.UA! 🚀\n\nЩоб отримувати миттєві сповіщення про ваші аукціони, ставки та угоди, прив'яжіть свій акаунт.\n\nНадішліть команду у форматі:\n\`/link вашта_пошта@email.com\``,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/link (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const email = match ? match[1] : '';

  if (!email) {
    bot.sendMessage(chatId, 'Будь ласка, вкажіть ваш email. Наприклад: /link ivan@example.com');
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      bot.sendMessage(chatId, `❌ Користувача з email ${email} не знайдено на KRAM.UA. Перевірте правильність вводу.`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: String(chatId) },
    });

    bot.sendMessage(
      chatId,
      `✅ Успішно! Ваш акаунт **${user.name}** прив'язано до цього Telegram-бота.\nТепер ви будете отримувати сповіщення про перебиті ставки та повідомлення.`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Сталася помилка при прив\'язці акаунту. Спробуйте пізніше.');
  }
});

// Експортуємо функцію для відправки повідомлень з нашого Next.js API
export async function sendTelegramNotification(chatId: string, message: string) {
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Помилка відправки в Telegram:', error);
  }
}
