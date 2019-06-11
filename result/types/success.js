const BaseResult = require("../base");
const { RESULTCODE } = require("./../const");

class SuccessResult extends BaseResult {
    constructor(data) {
        super({ code: RESULTCODE.SUCCESS, data });
    }
}

module.exports = SuccessResult;