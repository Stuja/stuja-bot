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
  select_poll:
    icons.invalid_operation +
    " " +
    "No has seleccionado ninguna encuesta: \n<code>Menciona la encuesta</code>",
  no_question:
    icons.invalid_operation +
    " " +
    "Ups, no has hecho ninguna pregunta: \n<code>/q + pregunta</code>",
};

function setWelcomeMessage(id, welcomeMessage) {
  const creation_date = new Date();
  database.ref(id + "/welcome").set({
    welcome: welcomeMessage,
    date: creation_date.getTime(),
  });
}

async function getWelcomeMessage(id, username) {
  return await database
    .ref(id + "/welcome")
    .child("welcome")
    .once("value")
    .then((snapshot) => {
      return snapshot.val().replace("$username", username);
    });
}

function addQuestion(chatId, creator, poll) {
  const creation_date = new Date();
  const pollId = poll.id;
  database.ref(chatId + "/questions/" + pollId).set({
    id: poll.id,
    date: creation_date.getTime(),
    creator: creator,
    question: poll.question,
    likes: poll.options[0].voter_count,
    dislikes: poll.options[1].voter_count,
    total_voter_count: poll.total_voter_count,
  });
}

function getContentFromCommand(command, input) {
  return input.split(command)[1];
}

function getUserName(sender) {
  return sender.username === undefined ? sender.first_name : sender.username;
}

module.exports = {
  setWelcomeMessage,
  addQuestion,
  getContentFromCommand,
  getWelcomeMessage,
  getUserName,
  icons,
  errorsMessages,
};
