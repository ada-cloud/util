class Service {
    constructor() {
        this._connection = null;
    }

    static configure = {
        name: '',
        dao: {},
        methods: {
            test: { transaction: false }
        }
    }

    beforeExcute(action) {
        return Promise().resolve();
    }

    afterExcute({ action, result }) {
        return Promise().resolve(result);
    }
}

module.exports = Service;