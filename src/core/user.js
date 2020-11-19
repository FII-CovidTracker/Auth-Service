const User = require('../models/UserModel');
const ObjectId = require('mongoose').Types.ObjectId;

class UserService {
    async get(id) {
        if (!id) {
            const users = await User.find({});
            return users.map(user => {
                return {
                    email: user.email,
                    name: user.name
                }
            });
        } else {
            const user = await User.findOne({ '_id': ObjectId(id) });
            if (user) return {
                id: user._id,
                name: user.name
            };
        }
    }

    async setName(id, name) {
        await User.updateOne({ '_id': ObjectId(id) }, { name })
    }
}

module.exports = UserService;