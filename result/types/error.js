const BaseResult = require("./../base");
const { RESULTCODE } = require("./../const");

class ErrorResult extends BaseResult {
    constructor(message) {
        super({ code: RESULTCODE.ERROR, message });
    }
}

module.exports = ErrorResult;