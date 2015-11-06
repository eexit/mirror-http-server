'use strict';

var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 80;

var _ = require('lodash');
var bunyan = require('bunyan');
var bodyParser = require('body-parser');
var pckg = require(__dirname + '/package.json');
var logger = bunyan.createLogger({name: pckg.name});
var express = require('express');
var app = express();

app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Intercepts all HTTP verb requests
app.all('*', function (req, res, next) {
    // Returned response headers
    var responseHeaders = {};

    // Parses the wanted response code
    var mirrorCode = req.get('X-Mirror-Code') || 200;

    // Finds out if the request should be returned as the response
    var mirrorRequest = (req.get('X-Mirror-Request')
        && req.get('X-Mirror-Request').toLowerCase() == 'true')
        || false;

    // Finds out if the response should be returned
    var mirrorBody = (req.get('X-Mirror-Body')
        && req.get('X-Mirror-Body').toLowerCase() == 'true')
        || false;

    // Parses X-Mirror-* headers, skips app specific headers
    var reqHeaders = _.without(
        _.filter(
            Object.keys(req.headers), function (name) {
                return _.startsWith(name, 'x-mirror-');
            }
        ), 'x-mirror-code', 'x-mirror-request', 'x-mirror-body'
    );

    // Injects X-Mirror-* headers to response headers
    reqHeaders.forEach(function (name) {
        var resHeader = _.startCase(_.trimLeft(name, 'x-mirror-')).replace(' ', '-');
        responseHeaders[resHeader] = req.headers[name];
    });

    // Builds the request object
    var request = {
        request: {
            ip: req.ip,
            ips: req.ips,
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
            body: req.body
        }
    };

    logger.info(request);


    // Prepares the response
    res.status(mirrorCode).set(responseHeaders);

    // Appends the full request or only the request body if wanted
    if (mirrorRequest) {
        res.json(request);
    } else if (mirrorBody) {
        res.send(req.body);
    }

    // Flushes!
    res.end();
});

// Basic error handler
app.use(function (err, req, res, next) {
    logger.fatal(err);
    res.status(500).json(err);
});

app.listen(port, host, 511, function () {
    logger.info('Listening on http://%s:%s', host, port);
});
