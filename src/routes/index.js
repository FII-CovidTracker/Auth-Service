const express = require('express');
const router = express.Router();

const env = require('../environment');
const AuthService = require('../core/auth');
const UserService = require('../core/user');

router.get('/', async (req, res) => {
   return res.status(200).json({
       message: `Hello, your are using '${env.UM.NAME}>' Service! 🛡️`
   })
});

router.post('/register', async (req, res) => {
    env.method('POST', req.originalUrl);

    if (!env.UM.OPTIONS.REGISTER_ACTIVE) {
        return res.status(200).json({ message: 'Register mechanism is turned off!' });
    }

    const { email, password, name } = req.body;

    if (email && password && name) {
        try {
            const auth = new AuthService();
            const { access_token, refresh_token } = await auth.signUp(email, password, name);
            res.status(200).json({ access_token, refresh_token });
        } catch (err) {
            if (err.name === 'DuplicatedUser') {
                const message = err.message;
                res.status(400).json({ message });
            } else {
                console.error(err);
                res.status(500).json({
                    message: 'Internal server error!'
                });
            }
        }
    } else {
        res.status(400).json({
            message: 'Insufficient data!'
        });
    }
});

router.post('/login', async (req, res) => {
    env.method('POST', req.originalUrl);

    if (!env.UM.OPTIONS.LOGIN_ACTIVE) {
        return res.status(200).json({ message: 'Login mechanism is turned off!' });
    }

    const data = req.body;
    const email = data.email;
    const password = data.password;

    if (email && password) {
        try {
            const auth = new AuthService();
            const { access_token, refresh_token } = await auth.signIn(email, password);
            res.status(200).json({ access_token, refresh_token });
        } catch (err) {
            if (err.name === 'UserNotFound' || err.name === 'IncorrectPassword') {
                const message = err.message;
                res.status(401).json({ message });
            }
        }
    } else {
        res.status(400).json({
            message: 'Insufficient data!'
        });
    }
});

router.get('/authorize', async (req, res) => {
    env.method('GET', req.originalUrl);

    const header = req.headers['authorization'];
    const access_token = header && header.split(' ')[1];

    if (access_token) {
        try {
            const auth = new AuthService();
            const decoded = await auth.authorize(access_token);
            const { email, iat, exp } = decoded;
            res.status(200).json({ email, iat, exp });
        } catch (err) {
            console.log(err.name);
            if (err.name === 'UserNotAuthorized' ||
                (err.name === 'JsonWebTokenError' && err.message === 'invalid token')
            ) {
                res.sendStatus(403);
            } else {
                res.sendStatus(500);
            }
        }
    } else {
        res.sendStatus(403);
    }
});

router.put('/token', async (req, res) => {
    env.method('PUT', req.originalUrl);

    const refresh_token = req.body.refresh_token;
    const email = req.body.email;

    if (refresh_token) {
        try {
            const auth = new AuthService();
            const { access_token } = await auth.token(refresh_token, email);
            res.status(200).json({ access_token })
        } catch (err) {
            if (err.name === 'InvalidRefreshToken') {
                res.status(400).json({
                    message: 'Invalid token!'
                })
            } else {
                console.log(err);
                res.sendStatus(500);
            }
        }
    } else {
        res.status(400).json({
            message: 'Invalid token!'
        });
    }
});

async function authorize(req, res, next) {
    const header = req.headers['authorization'];
    const access_token = header && header.split(' ')[1];

    if (!access_token) return res.sendStatus(403);

    try {
        const auth = new AuthService();
        res.locals = {
            user: await auth.authorize(access_token)
        };
        next();
    } catch (err) {
        console.log(err);
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.sendStatus(403);
        }
        return res.sendStatus(403);
    }
}

router.get('/sa', authorize, async (req, res) => {
    env.method('GET', req.originalUrl);

    const user = new UserService();

    try {
        const users = await user.get();
        await res.json(users);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;