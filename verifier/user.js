const { PASSWORD } = require("./../const");

class UserVerifier {
    constructor(userMap) {
        this._users = userMap;
    }

    check(username, password) {
        let pass = this._users[username];
        if (pass) {
            if (PASSWORD(pass) === password) {
                return true;
            }
        }
        return false;
    }
}

module.exports = UserVerifier;