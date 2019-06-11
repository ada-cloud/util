class BaseResult {
    constructor({ code, data, message }) {
        this._code = code;
        this._data = data;
        this._message = message;
    }

    get code() {
        return this._code;
    }

    get data() {
        return this._data;
    }

    get message() {
        return this._message;
    }

    stringify() {
        return JSON.stringify(this.getResponseData());
    }

    getResponseData() {
        let r = {};
        ['code', 'message', 'data'].forEach(key => {
            if (this[key] !== undefined) {
                r[key] = this[key];
            }
        });
        return r;
    }
}

module.exports = BaseResult;