const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const ObjectId = require('mongoose').Types.ObjectId;

const env = require('../environment');
const AuthError = require('./errors');
const User = require('../models/UserModel');

function payloadJWT(user) {
    return { _id: user._id, email: user.email };
}

function signJWT(payload) {
    return jwt.sign(payload, env.UM.JWT.SECRET, { expiresIn: env.UM.JWT.EXPIRATION });
}

function verifyJWT(token) {
    return jwt.verify(token, env.UM.JWT.SECRET);
}

class AuthService {
    async signUp(email, password, name) {
        const hashedPassword = await argon2.hash(password);
        const user = new User({
            email,
            name,
            password: hashedPassword
        });

        try {
            await user.save();
        } catch (err) {
            if (err.code === 11000) {
                throw new AuthError.DuplicatedUser(email, err);
            } else {
                throw err;
            }
        }

        const access_token = signJWT(payloadJWT(user));
        const refresh_token = jwt.sign(payloadJWT(user), env.UM.JWT.REFRESH);

        try {
            user.refresh = refresh_token;
            await user.save();
        } catch (err) {
            throw err;
        }

        return { access_token, refresh_token } // different payloads
    }

    async signIn(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AuthError.UserNotFound(email);
        }

        const identicalPasswords = await argon2.verify(user.password, password);
        if (!identicalPasswords) {
            throw new AuthError.IncorrectPassword(email, password);
        }

        return {
            access_token: signJWT(payloadJWT(user)),
            refresh_token: user.refresh
        };
    }

    async authorize(access_token) {
        return verifyJWT(access_token);
    }

    async token(refresh_token, email) {
        const docs = await User.find({ refresh: refresh_token });

        if (docs.length !== 1) {
            throw new AuthError.InvalidRefreshToken(refresh_token);
        }

        const decode = jwt.verify(refresh_token, env.UM.JWT.REFRESH);

        if (decode.email !== email) {
            throw new AuthError.InvalidRefreshToken(refresh_token);
        }

        return { access_token: signJWT(payloadJWT(decode)) };
    }

    async updateCredentials(id, password, new_password) {
        const user = await User.findOne({ '_id': ObjectId(id) });
        if (!user) {
            throw new AuthError.UserNotFound();
        }

        const identicalPasswords = await argon2.verify(user.password, password);
        if (!identicalPasswords) {
            throw new AuthError.IncorrectPassword(id, password);
        }

        user.password = await argon2.hash(new_password);
        await user.save()
    }
}

module.exports = AuthService;