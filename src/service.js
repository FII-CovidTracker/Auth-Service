const express = require('express');
const mongoose = require('mongoose');

const env = require('./environment');
const router = require('./routes');

const service = express();

service.use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(env.UM.API_PATH, router);

(async _ => {
    env.log(`Starting...`);
    try {
        await mongoose.connect(env.UM.DATABASE.URL, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        env.log(`${env.format.bold('MongoDB')} available`);

        service.get('/', (req, res) => {
            res.redirect(env.UM.API_PATH);
        });

        service.listen(env.UM.PORT, _ => {
            env.log(`Listening on port ${env.UM.PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
})();