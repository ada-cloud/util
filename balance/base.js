class BaseLoadBalance {
    constructor(list) {
        this._list = list;
    }

    getServiceList() {
        return this._list;
    }

    updateServiceList(list) {
        this._list = list;
    }

    sort() {
        return this._list.sort((a, b) => a.id.localeCompare(b.id));
    }

    getService() {
    }
}

module.exports = BaseLoadBalance;