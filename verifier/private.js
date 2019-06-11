const jwt = require('jsonwebtoken');
const { PASSWORD } = require("./../const");

class PrivateVerifier {
    constructor(privateKeyCode) {
        this._keyCode = privateKeyCode;
    }

    getToken(info) {
        return jwt.sign(info, this._keyCode, { algorithm: 'RS256' });
    }
}

module.exports = PrivateVerifier;