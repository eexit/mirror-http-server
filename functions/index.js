'use strict';

const mirror = require('./mirror'),
    functions = require('firebase-functions');

module.exports = {
    mirror: functions
        .runWith({
            maxInstances: 10,
            timeoutSeconds: 540, // 9 min, max
            memory: "128MB", // min
        })
        .https
        .onRequest(mirror.app)
};
