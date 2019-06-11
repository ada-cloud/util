const BaseResult = require("../base");
const { RESULTCODE } = require("../const");

class NofoundResult extends BaseResult {
    constructor(message) {
        super({ code: RESULTCODE.NOFOUND, message });
    }
}

module.exports = NofoundResult;