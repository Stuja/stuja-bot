process.env.NTBA_FIX_319 = 1;

const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");
const TOKEN = config.telegramToken;

const token = TOKEN;

const options = {
  webHook: {
    port: process.env.PORT,
  },
  // to run local node, comment webhook and uncomment polling
  // polling: true
};

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, options);
bot.setWebHook(
  "https://stuja-bot-ciu4jjvvsq-ew.a.run.app:80/bot" + config.telegramToken
);

bot.onText(/hola/, (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;

  // send back a message with the name of the user
  bot.sendMessage(chatId, "Hola " + msg.from.first_name);
});

bot.on("new_chat_members", (msg) => {
  const chatId = msg.chat.id;
  const username = msg.new_chat_participant.username;
  bot.sendMessage(chatId, "Bienvenido " + username);
});

bot.on("polling_error", (err) => console.log(err));
