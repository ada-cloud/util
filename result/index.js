const ErrorResult = require("./types/error");
const SuccessResult = require("./types/success");
const LoginResult = require("./types/login");
const LoginedResult = require("./types/logined");
const UnauthorizedResult = require("./types/unauthorized");
const NofoundResult = require("./types/nofound");
const Result = require("./base");
const { RESULTCODE } = require("./const");

const MAP = {
    [RESULTCODE.SUCCESS]: { type: SuccessResult, parameter: ['data'] },
    [RESULTCODE.ERROR]: { type: ErrorResult, parameter: ['message'] },
    [RESULTCODE.NEEDLOGIN]: { type: LoginResult, parameter: [] },
    [RESULTCODE.LOGINED]: { type: LoginedResult, parameter: [] },
    [RESULTCODE.UNAUTHORIZED]: { type: UnauthorizedResult, parameter: [] },
    [RESULTCODE.NOFOUND]: { type: NofoundResult, parameter: [] }
};

module.exports = {
    ErrorResult,
    SuccessResult,
    LoginResult,
    LoginedResult,
    UnauthorizedResult,
    NofoundResult,
    Result,
    parse(str) {
        let info = JSON.parse(str), { code, message, data } = info;
        let target = MAP[code];
        if (target) {
            let { type, parameter } = target;
            return new type(...parameter.map(a => info[a]));
        } else {
            return new Result({ code, message, data });
        }
    },
    getErrorResult(message) {
        return new ErrorResult(message);
    },
    getSuccessResult(data) {
        return new SuccessResult(data);
    },
    getLoginResult() {
        return new LoginResult();
    },
    getLoginedResult() {
        return new LoginedResult();
    },
    getUnauthoriedResult() {
        return new UnauthorizedResult();
    },
    getNofoundResult() {
        return new NofoundResult();
    },
    getResult(code, data, message) {
        return new Result({ code, data, message });
    }
}