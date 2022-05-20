'use strict';

const mirror = require('./mirror'),
    functions = require('firebase-functions');

module.exports = { mirror: functions.https.onRequest(mirror.app) };
