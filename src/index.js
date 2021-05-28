'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const path = require('path')
const logger = require('pino')();
const redbird = require('redbird');
const {retrieve, persist} = require('./store');
const {getEnv, envTypes} = require('./env')('FRP_SSL_PROXY_');

const storePath = getEnv('STORE_PATH', path.resolve(`${__dirname}/../data/store.json`), envTypes.string);

const configuration = {
    letsEncrypt: {
        email: getEnv('EMAIL', 'test@foo.com', envTypes.string),
        production: getEnv('PRODUCTION', false, envTypes.bool)
    },
    httpPort: getEnv('HTTP_PORT', 80, envTypes.int),
    httpsPort: getEnv('HTTPS_PORT', 443, envTypes.int),
    letsEncryptPort: getEnv('LETSENCRYPT_PORT', 9999, envTypes.int),
    subdomainHost: getEnv('SUBDOMAIN_HOST', 'tunnel.example.com', envTypes.string),
    defaultTarget: getEnv('PROXY_TARGET', 'http://frps:80', envTypes.string),
    apiHttpPort: getEnv('API_HTTP_PORT', 9002, envTypes.int),
    certsPath: getEnv('CERTS_PATH', path.resolve(`${__dirname}/../data/certs`), envTypes.string),
    xfwd: getEnv('X_FORWARD', true, envTypes.bool),
};
logger.info({configuration}, 'Configuration loaded');

const store = retrieve(storePath, {
    hosts: [],
});

const proxy = redbird({
    port: configuration.httpPort,
    xfwd: configuration.xfwd,
    letsencrypt: {
        path: configuration.certsPath,
        port: configuration.letsEncryptPort
    },
    ssl: {
        http2: true,
        port: configuration.httpsPort,
    }
});

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use('/link', (request, response, next) => {
    const sendError = (message) => {
        logger.error(message);
        response.status(500).json({
            reject: true,
            reject_reason: message
        });
    }

    if (!request.body.op) {
        return sendError('No "Op" parameter');
    }

    if (request.body.op !== 'NewProxy') {
        return sendError('"Op" parameter is not "NewProxy"');
    }

    if (!request.body.content) {
        return sendError('No "content" parameter');
    }

    if (request.body.content.subdomain) {
        addRoute(`${request.body.content.subdomain}.${configuration.subdomainHost}`);
    }

    if (request.body.content.custom_domains) {
        request.body.content.custom_domains.map((domain) => {
            addRoute(domain);
        });
    }
    response.status(200).json({
        reject: false,
        unchange: true
    });
    next();
});

const addRoute = (domain) => {
    if (store.hosts.indexOf(domain) === -1) {
        store.hosts.push(domain);
        persist(storePath, configuration);
    }
    let connectionInfo = {
        ssl: {
            letsencrypt: configuration.letsEncrypt
        }
    };
    if (Object.keys(proxy.routing).indexOf(domain) !== -1) {
        return;
    }
    logger.info(`Register domain ${domain}`);
    proxy.register(domain, configuration.defaultTarget, connectionInfo);
};

store.hosts.map(addRoute);

http.createServer(app).listen(configuration.apiHttpPort, () => {
    logger.info(`API Http Server is running on ${configuration.apiHttpPort}`);
});
