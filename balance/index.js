const RandomLoadBalance = require("./types/random");
const RoundRobinLoadBalance = require("./types/robin");
const WeightRandomLoadBalance = require("./types/weight.random");
const WeightRoundBobinLoadBalance = require("./types/weight.robin");

const MAP = {
    random: RandomLoadBalance,
    roundrobin: RoundRobinLoadBalance,
    weightrandom: WeightRandomLoadBalance,
    weightroundrobin: WeightRoundBobinLoadBalance
};

const BalanceTypes = {
    RANDOM: 'random',
    ROUNDROBIN: 'roundrobin',
    WEIGHTRANDOM: 'weightrandom',
    WEIGHTROUNDROBIN: 'weightroundrobin'
};

class LoadBalance {
    constructor(type, list) {
        this.swithBalanceType(type, list);
    }

    get balance() {
        return this._balance;
    }

    swithBalanceType(type, list) {
        let target = MAP[type];
        if (target) {
            if (!list && this.balance) {
                list = this.balance.getServiceList();
            }
            this._balance = new target(list);
        } else {
            throw Error('can not support balance method of ' + type);
        }
    }

    updateServiceList(list) {
        this.balance.updateServiceList(list);
    }

    getService() {
        return this.balance.getService();
    }
}

module.exports = { LoadBalance, BalanceTypes };