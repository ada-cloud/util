const { SuccessResult, ErrorResult, LoginResult, UnauthorizedResult } = require("./../../result");

class Controller {
    static configure() {
        return {
            basePath: "",
            actions: {
                set: { path: "/set", method: 'get' }
            },
            service: {
                service: ''
            }
        }
    }

    beforeExcute({ context, action }) {
        return Promise.resolve();
    }

    afterExcute({ context, action }) {
        return Promise.resolve();
    }

    actionNotFound({ context, action }) {
        return Promise.resolve();
    }

    actionExcuteError({ context, action, error }) {
        return Promise.resolve();
    }

    success(data) {
        return new SuccessResult(data);
    }

    error(data) {
        return new ErrorResult(data);
    }

    login() {
        return new LoginResult();
    }

    unauthorized() {
        return new UnauthorizedResult();
    }
}

module.exports = Controller;