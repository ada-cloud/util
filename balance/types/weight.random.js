const Base = require("./../base");
const loadbalance = require("loadbalance");
class WeightRandomLoadBalance extends Base {
    constructor(list) {
        super(list);
        this._balance = loadbalance.random(this.sort().map(a => {
            return { object: { id: a.id }, weight: a.weight || 1 };
        }));
    }

    updateServiceList(list) {
        super.updateServiceList(list);
        this._balance = loadbalance.random(this.sort().map(a => {
            return { object: { id: a.id }, weight: a.weight || 1 };
        }));
    }

    getService() {
        let { id } = this._balance.pick();
        return this.getServiceList().find(a => a.id === id);
    }
}

module.exports = WeightRandomLoadBalance;