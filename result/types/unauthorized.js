const BaseResult = require("../base");
const { RESULTCODE } = require("../const");

class UnauthoriedResult extends BaseResult {
    constructor() {
        super({ code: RESULTCODE.UNAUTHORIZED });
    }
}

module.exports = UnauthoriedResult;