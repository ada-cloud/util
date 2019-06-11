const BaseResult = require("../base");
const { RESULTCODE } = require("../const");

class LoginedResult extends BaseResult {
    constructor() {
        super({ code: RESULTCODE.LOGINED, message: "NEEDLOGIN" });
    }
}

module.exports = LoginedResult;