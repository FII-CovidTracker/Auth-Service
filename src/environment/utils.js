const fs = require('fs');
const path = require('path');
const https = require('https');

/* Prototypes */

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
};

String.prototype.rsplit = function(sep, maxsplit) {
    const split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
};

/* Logging */

function logger(env) {
    env.log = (message) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            process.stdout.write(env.format.cyan(env.PRINT));
            console.log(message);
        }
    };

    env.log.data = (data) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            console.log(data);
        }
    };

    env.error = (zone, message) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            process.stdout.write(env.format.cyan(env.PRINT));
            console.error(env.format.red(`${zone}: `));
            console.error(message);
        } else {
            console.error(zone, message);
        }
    };

    env.method = (method, url) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            process.stdout.write(env.format.cyan(env.PRINT));
            console.log(env.format.yellow(method.toUpperCase().padEnd(6)) + ' ' + url);
        }
    };

    env.method.ws = (url) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            process.stdout.write(env.format.cyan(env.PRINT));
            console.log(env.format.magenta('WS'.padEnd(6)) + ' ' + url);
        }
    };

    env.log.body = (req) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            console.log('body:', req.body);
        }
    };

    env.log.query = (req) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            console.log('query:', req.query);
        }
    };

    env.log.params = (req) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            console.log('params:', req.params);
        }
    };

    env.log.file = (req) => {
        if (env.mode === env.modes.DEVELOPMENT || env.logs) {
            console.log('params:', req.file);
        }
    };

    env.log.request = (req) => {
        env.method(req.method, req.originalUrl);

        const isEmpty = (object) => {
            return Object.keys(object).length === 0 && object.constructor === Object;
        };

        if (!isEmpty(req.params)) env.log.params(req);
        if (!isEmpty(req.query)) env.log.query(req);
        if (!isEmpty(req.body)) env.log.body(req);
        if (req.file) env.log.file(req);
    };

    env.log.request.ws = (req) => {
        env.method.ws(req.originalUrl);
    };

    env.catch = (req, res, err) => {
        if (!err.response) {
            env.error(req.originalUrl, err);
            return res.sendStatus(500);
        }

        env.error(req.originalUrl, err.response.status);

        if (err.response.data && err.response.data.message) {
            env.log.data(err.response.data);
            return res.status(err.response.status).json(err.response.data);
        }

        return res.sendStatus(err.response.status);
    };

    env.catch.ws = (ws, req, err) => {
        console.error(err);
        ws.close();
    };

    return env;
}

module.exports = {
    logger
};