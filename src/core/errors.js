/* Authentication */

// SignUp Error
class DuplicatedUser extends Error {
    constructor(email, mongoError) {
        super();
        this.name = 'DuplicatedUser';
        this.message = 'This account already exists!';
        this.internalMessage = `User '${email}' is duplicated!`;
        this.mongoError = mongoError;
    }
}

// SignIn Error
class UserNotFound extends Error {
    constructor(param) {
        super();
        this.name = 'UserNotFound';
        this.message = 'Email or password is incorrect!'; // Email or _id not found
        this.internalMessage = `User '${param}' not found!`;
    }
}

// SignIn Error
class IncorrectPassword extends Error {
    constructor(param, password) {
        super();
        this.name = 'IncorrectPassword';
        this.message = 'Email or password is incorrect!'; // Wrong password
        this.internalMessage = `User '${param}' mistook his password!\nHis attempt '${password}'`;
    }
}

/* Authorization */
class UserNotAuthorized extends Error {
    constructor(token) {
        super();
        this.name = 'UserNotAuthorized';
        this.message = 'Access forbidden!';
        this.internalMessage = `Unknown user has no access!\nHis attempt '${token}'`;
    }
}

class InvalidRefreshToken extends Error {
    constructor(token) {
        super();
        this.name = 'InvalidRefreshToken';
        this.message = 'Invalid token!';
        this.internalMessage = `Unknown user has no access!\nHis attempt '${token}'`;
    }
}

module.exports = {
    DuplicatedUser,
    UserNotFound,
    IncorrectPassword,
    UserNotAuthorized,
    InvalidRefreshToken
};