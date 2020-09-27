//Adding firebase support
var firebase = require('firebase/app');
var config = require('../config');
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