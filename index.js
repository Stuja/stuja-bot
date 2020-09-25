process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const config = require("./config");
const TOKEN = config.telegramToken;

const token = TOKEN;

const options = {
    /* webHook: {
        port: process.env.PORT,
    } */
    // to run local node, comment webhook and uncomment polling
    polling: true
};

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, options);


bot.onText(/hola/, (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;

  // send back a message with the name of the user
  bot.sendMessage(chatId, "Hola " + msg.from.first_name);
});

