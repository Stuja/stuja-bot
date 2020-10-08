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
  if (welcomeMessage != undefined) {
    bot.sendMessage(msg.chat.id, welcomeMessage);
  }
});

bot.onText(/\/set_welcome/, (msg) => {
  const input = msg.text;
  const welcomeMessage = utils.getContentFromCommand("/set_welcome ", input);
  utils.setWelcomeMessage(msg.chat.id, welcomeMessage);
});

bot.onText(/\/q/, async (msg) => {
  const input = msg.text;
  const question = utils.getContentFromCommand("/q ", input);
  if (question === undefined) {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.no_question, {
      parse_mode: "HTML",
    });
  } else {
    if (databaseOn) {
      utils.addQuestionToDatabase(
        msg.chat.id,
        msg.message_id,
        question,
        utils.getUserName(msg.from)
      );
    }
  }
});

bot.onText(/\/a/, (msg) => {
  const input = msg.text;
  const answer = utils.getContentFromCommand("/a ", input);
  if (answer === undefined) {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.no_answer, {
      parse_mode: "HTML",
    });
  } else if (msg.reply_to_message === undefined) {
    bot.sendMessage(msg.chat.id, utils.errorsMessages.select_question, {
      parse_mode: "HTML",
    });
  } else {
    const question = utils.getContentFromCommand(
      "/q",
      msg.reply_to_message.text
    );
    bot
      .sendPoll(msg.chat.id, "Q: " + question + "\nA: " + answer, [
        utils.icons.like,
        utils.icons.dislike,
      ])
      .then((payload) => {
        utils.addAnswerToDatabase(
          msg.chat.id,
          payload.poll.id,
          answer,
          utils.getUserName(msg.from),
          msg.reply_to_message.message_id
        );
      });
  }
});

bot.on("poll", (poll) => {
  utils.updateAnswerOnDatabase(poll);
});

bot.on("polling_error", (err) => console.log(err));
