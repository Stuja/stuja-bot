process.env.NTBA_FIX_319 = 1;

const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");
const token = config.telegramToken;
var utils = require("./utils.js");

const runningLocal = false;
const databaseOn = true;

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

bot.onText(/\/hola/, (msg) => {
  const username = utils.getUserName(msg.from);
  bot.sendMessage(msg.chat.id, "Hola " + username);
});

bot.on("new_chat_members", async (msg) => {
  const username = utils.getUserName(msg.new_chat_participant);
  const welcomeMessage = await utils.getWelcomeMessage(msg.chat.id, username);
  bot.sendMessage(msg.chat.id, welcomeMessage);
});

bot.onText(/\/set_welcome/, (msg) => {
  const chatId = msg.chat.id;
  const input = msg.text;
  const welcomeMessage = utils.getContentFromCommand("/set_welcome ", input);
  utils.setWelcomeMessage(chatId, welcomeMessage);
});

bot.onText(/\/q/, async (msg) => {
  const input = msg.text;
  const question = utils.getContentFromCommand("/q ", input);
  if (question === undefined) {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.no_question, {
      parse_mode: "HTML",
    });
  } else {
    bot
      .sendPoll(msg.chat.id, question, [utils.icons.like, utils.icons.dislike])
      .then((payload) => {
        if (databaseOn) {
          utils.createQuestion(
            msg.chat.id,
            utils.getUserName(msg.chat),
            payload.poll
          );
        }
        console.log(payload.poll);
      });
  }
});

bot.onText(/\/stop/, (msg) => {
  if (msg.reply_to_message != undefined) {
    if (msg.reply_to_message.poll.is_closed) {
      bot.sendMessage(msg.chat.id, utils.errorsMessages.closed_poll);
    } else {
      var replyMessageId = msg.reply_to_message.message_id;
      if (databaseOn) {
        utils.updateQuestion(msg.chat.id, msg.reply_to_message.poll);
      }
      bot.stopPoll(msg.chat.id, replyMessageId);
      bot.sendMessage(msg.chat.id, utils.infoMessages.closed_poll);
    }
  } else {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.select_poll, {
      parse_mode: "HTML",
    });
  }
});

bot.onText(/\/a/, (msg) => {
  const input = msg.text;
  const answer = utils.getContentFromCommand("/a ", input);
  const question = msg.reply_to_message.poll.question;
  if (answer === undefined) {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.no_answer, {
      parse_mode: "HTML",
    });
  } else {
    bot.sendPoll(msg.chat.id, "Q: " + question + "\nA: " + answer, [
      utils.icons.like,
      utils.icons.dislike,
    ]);
  }
});

bot.on("polling_error", (err) => console.log(err));
