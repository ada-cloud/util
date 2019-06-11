const Result = require("./../result");
class Fuse {
    constructor(action, { retryTime = 5, delay = 500, defaultResult = Result.getErrorResult().getResponseData() } = {}) {
        this._action = action;
        this._retryTime = retryTime;
        this._defaultResult = defaultResult;
        this._delay = delay;
    }

    excute() {
        let abort = null;
        let ps = new Promise(resolve => {
            let retryTime = 0, errors = [], currentPromise = null, isAbort = false;
            abort = () => {
                isAbort = true;
                if (currentPromise && currentPromise.abort) {
                    currentPromise.abort();
                }
                resolve({});
            }
            let excutor = () => {
                currentPromise = this._action();
                currentPromise.then(data => {
                    if (!isAbort) {
                        resolve(data);
                    }
                }).catch(e => {
                    if (!isAbort) {
                        retryTime++;
                        errors.push(e);
                        if (retryTime > this._retryTime) {
                            resolve(Object.assign(this._defaultResult || {}, { message: errors }));
                        } else {
                            setTimeout(() => excutor(), this._delay);
                        }
                    }
                });
            }
            excutor();
        });
        ps.abort = () => {
            abort && abort();
        };
        return ps;
    }
}

module.exports = Fuse;