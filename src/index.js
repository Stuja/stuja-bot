process.env.NTBA_FIX_319 = 1;

const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");
const token = config.telegramToken;
var utils = require("./utils.js");

const runningLocal = false;

var options;
if (runningLocal) {
  options = { polling: true };
} else {
  options = {
    webHook: {
      port: process.env.PORT,
    },
  };
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, options);
bot.setWebHook(
  "https://stuja-prod-ciu4jjvvsq-ew.a.run.app:443/bot" + config.telegramToken
);

bot.onText(/hola/, (msg) => {
  // 'msg' is the received Message from Telegram
  const chatId = msg.chat.id;

  // send back a message with the name of the user
  bot.sendMessage(chatId, "Hola " + msg.from.first_name);
});

bot.on("new_chat_members", async (msg) => {
  const chatId = msg.chat.id;
  const username =
    msg.new_chat_participant.username === undefined
      ? msg.new_chat_participant.first_name
      : msg.new_chat_participant.username;
  console.log(username);
  const welcomeMessage = await utils.getWelcomeMessage(chatId, username);
  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/set_welcome/, (msg) => {
  const chatId = msg.chat.id;
  const input = msg.text;
  const welcomeMessage = utils.getContentFromCommand("/set_welcome ", input);
  utils.setWelcomeMessage(chatId, welcomeMessage);
});

bot.onText(/q/, (msg) => {
  const input = msg.text;
  const question = utils.getContentFromCommand("/q ", input);
  if (question === undefined) {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.no_question, {
      parse_mode: "HTML",
    });
  } else {
    bot.sendPoll(msg.chat.id, question, [
      utils.icons.like,
      utils.icons.dislike,
    ]);
  }
});

bot.onText(/stop/, (msg) => {
  if (msg.reply_to_message != undefined) {
    if (msg.reply_to_message.poll.is_closed) {
      bot.sendMessage(msg.chat.id, utils.errorsMessages.closed_poll);
    } else {
      var replyMessageId = msg.reply_to_message.message_id;
      utils.addQuestion(
        msg.chat.id,
        utils.getUserName(msg.chat),
        msg.reply_to_message.poll
      );
      bot.stopPoll(msg.chat.id, replyMessageId);
    }
  } else {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.select_poll, {
      parse_mode: "HTML",
    });
  }
});

bot.on("polling_error", (err) => console.log(err));
