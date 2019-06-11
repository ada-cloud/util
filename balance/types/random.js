const Base = require("./../base");
const loadbalance = require("loadbalance");
class RandomLoadBalance extends Base {
    constructor(list) {
        super(list);
        this._balance = loadbalance.random(this.sort().map(a => a.id));
    }

    updateServiceList(list) {
        super.updateServiceList(list);
        this._balance = loadbalance.random(this.sort().map(a => a.id));
    }

    getService() {
        let id = this._balance.pick();
        return this.getServiceList().find(a => a.id === id);
    }
}

module.exports = RandomLoadBalance;