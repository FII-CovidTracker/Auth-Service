const chalk = require('chalk');
const dotEnv = require('dotenv');
const utils = require('./utils');

dotEnv.config();

let env = {
    format: chalk,
    mode: process.env.MODE,
    logs: true,
    modes: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production'
    },
    PRINT: `[${process.env.UM_SERVICE_NAME}] `,
    UM: {
        NAME: process.env.UM_SERVICE_NAME,
        API_PATH: process.env.UM_API_PATH,
        PORT: process.env.PORT || 8080,
        HOST: process.env.UM_PROD_DOMAIN + process.env.UM_API_PATH,
        DATABASE: {
            URL: process.env.UM_PROD_DATABASE_URL
        },
        JWT: {
            SECRET: process.env.UM_JWT_SHARED_SECRET,
            EXPIRATION: process.env.UM_JWT_EXPIRATION_TIME,
            REFRESH: process.env.UM_REFRESH_SECRET
        },
        OPTIONS: {
            REGISTER_ACTIVE: process.env.UM_REGISTER_ACTIVE.toLowerCase() === 'true',
            LOGIN_ACTIVE: process.env.UM_LOGIN_ACTIVE.toLowerCase() === 'true'
        }
    }
};

if (env.mode === env.modes.DEVELOPMENT) {
    env.UM.PORT = process.env.UM_DEV_PORT;
    env.UM.HOST = `${process.env.UM_DEV_DOMAIN}:${process.env.UM_DEV_PORT + process.env.UM_API_PATH}`;
    env.UM.DATABASE.URL = process.env.UM_DEV_DATABASE_URL;
}

env = utils.logger(env);

console.log('env', env);

module.exports = env;