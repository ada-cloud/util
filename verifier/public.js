const jwt = require('jsonwebtoken');

class PublicVerifier {
    constructor(publicKeyCode) {
        this._keyCode = publicKeyCode;
    }

    verify(token) {
        try {
            return jwt.verify(token, this._keyCode);
        } catch (err) {
            return null;
        }
    }
}

module.exports = PublicVerifier;