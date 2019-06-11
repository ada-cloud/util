const PrivateVerifier = require("./private");
const PublicVerifier = require("./public");
const UserVerifier = require("./user");
const { PASSWORD } = require("./../const");

class Verify {
    constructor({ privateKey, publicKey, users }) {
        this._private = new PrivateVerifier(privateKey);
        this._public = new PublicVerifier(publicKey);
        this._users = new UserVerifier(users);
    }

    getToken({ username, password }, info) {
        if (this._users.check(username, password)) {
            return this._private.getToken(info);
        }
        return null;
    }

    verifyToken(token) {
        return this._public.verify(token);
    }

    static getPassword(password) {
        return PASSWORD(password);
    }
}

module.exports = Verify;