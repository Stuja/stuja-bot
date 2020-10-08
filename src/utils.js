//Adding firebase support
var firebase = require("firebase/app");
var config = require("./config");
require("firebase/database");

var firebaseConfig = {
  apiKey: config.firebaseApi,
  authDomain: config.authDomain,
  databaseURL: config.dbUrl,
  projectId: config.projectId,
  storageBucket: config.storage,
  messagingSenderId: config.sender,
  appId: config.appId,
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

const icons = {
  like: "👍",
  dislike: "👎",
  invalid_operation: "⚠️",
  successfull_operation: "🚀",
  info: "ℹ️",
};

const errorsMessages = {
  closed_poll:
    icons.invalid_operation + " " + "La encuesta seleccionada ya está cerrada.",
  select_question:
    icons.invalid_operation +
    " " +
    "No has seleccionado ninguna encuesta: \n<code>Menciona la pregunta</code>",
  no_question:
    icons.invalid_operation +
    " " +
    "Ups, no has hecho ninguna pregunta: \n<code>/q + pregunta</code>",
  no_answer:
    icons.invalid_operation +
    " " +
    "Ups, no has respondido: \n<code>/a + respuesta</code>",
};

const infoMessages = {
  closed_poll: icons.info + " " + "La encuesta ha concluido.",
};

function setWelcomeMessage(chatId, welcomeMessage) {
  const creation_date = new Date();
  database.ref("/welcomes/" + chatId).set({
    welcome: welcomeMessage,
    date: creation_date.getTime(),
  });
}

async function getWelcomeMessage(chatId, username) {
  return await database
    .ref("/welcomes/" + chatId)
    .child("welcome")
    .once("value")
    .then((snapshot) => {
      return snapshot.val().replace("$username", username);
    });
}

function addQuestionToDatabase(chatId, msgId, question, author) {
  const creationDate = new Date();
  database.ref("/questions/" + chatId + "/" + msgId).set({
    creation_date: creationDate.getTime(),
    author: author,
    question: question,
  });
}

function addAnswerToDatabase(
  chatId,
  answerId,
  answer,
  answerAuthor,
  questionId
) {
  const creationDate = new Date();
  database.ref("/answers/" + answerId).set({
    creation_date: creationDate.getTime(),
    answer: answer,
    author: answerAuthor,
    chat_id: chatId,
    question_id: questionId,
  });
  database
    .ref("/questions/" + chatId + "/" + questionId + "/answers")
    .set({ answer_id: answerId });
}

function updateAnswerOnDatabase(poll) {
  database.ref("/answers/" + poll.id).update({
    likes: poll.options[0].voter_count,
    dislikes: poll.options[1].voter_count,
    total_voter_count: poll.total_voter_count,
  });
  console.log(poll);
}

function getContentFromCommand(command, input) {
  return input.split(command)[1];
}

function getUserName(sender) {
  return sender.username === undefined ? sender.first_name : sender.username;
}

module.exports = {
  setWelcomeMessage,
  addQuestionToDatabase,
  addAnswerToDatabase,
  getContentFromCommand,
  getWelcomeMessage,
  getUserName,
  updateAnswerOnDatabase,
  icons,
  errorsMessages,
  infoMessages,
};
