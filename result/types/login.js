const BaseResult = require("./../base");
const { RESULTCODE } = require("./../const");

class NeedLoginResult extends BaseResult {
    constructor() {
        super({ code: RESULTCODE.NEEDLOGIN, message: "NEEDLOGIN" });
    }
}

module.exports = NeedLoginResult;