//Adding firebase support
var firebase = require('firebase/app');
var config = require('./config');
require('firebase/database');

var firebaseConfig = {
    apiKey: config.firebaseApi,
    authDomain: config.authDomain,
    databaseURL: config.dbUrl,
    projectId: config.projectId,
    storageBucket: config.storage,
    messagingSenderId: config.sender,
    appId: config.appId
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function setWelcomeMessage(id, welcomeMessage) {
    const creation_date = new Date();
    database.ref(id+'/welcome').set({
        welcome: welcomeMessage,
        date: creation_date.getTime()
    });
}

function getWelcomefromInput(input){
    return input.split("/set_welcome ")[1];
}

module.exports = {
    setWelcomeMessage,
    getWelcomefromInput
}