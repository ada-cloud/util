const Dao = require("./index");
const Model = require("./../model");
const { debug } = require("./../../../const");

class MySqlDao extends Dao {
    static configure() {
        return {
            name: "dao",
            datasource: "defaultMysqlDatasource"
        }
    }

    query(...args) {
        return this.connection.query(...args);
    }

    excute(...args) {
        return this.connection.excute(...args);
    }

    find(model) {
        if (model instanceof Model) {
            let { sql, values, info } = model.getQueryLimitSqlInfo(0, 1);
            debug(sql, values);
            return this.query(sql, values).then(result => {
                if (result && result[0] && result[0][0]) {
                    return this._setModelInfo(model, result[0][0] || {}, info);
                } else {
                    return null;
                }
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    findAll(model) {
        if (model instanceof Model) {
            let { sql, values, info } = model.getQuerySqlInfo();
            debug(sql, values);
            return this.query(sql, values).then(result => {
                return result[0].map(item => {
                    return this._setModelInfo(model, item, info);
                });
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    findAllOrder(model, { asc = [], desc = [] } = {}) {
        if (model instanceof Model) {
            let { sql, values, info } = model.getQueryOrderSqlInfo({ asc, desc });
            debug(sql, values);
            return this.query(sql, values).then(result => {
                return result[0].map(item => {
                    return this._setModelInfo(model, item, info);
                });
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    findPage(model, from = 0, size = 10) {
        if (model instanceof Model) {
            let { sql, values, info } = model.getQuerySqlCountInfo(from, size);
            let _result = { total: 0, list: [] };
            return this.query(sql, values).then(result => {
                _result.total = result[0][0]['COUNT(*)'];
                let { sql, values, info } = model.getQueryLimitSqlInfo(from, size);
                debug(sql, values);
                return this.query(sql, values).then(result => {
                    _result.list = result[0].map(item => {
                        return this._setModelInfo(model, item, info);
                    });
                    return _result;
                });
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    findOrderPage(model, { asc = [], desc = [], from = 0, size = 10 } = {}) {
        if (model instanceof Model) {
            let { sql, values, info } = model.getQueryOrderLimitSqlInfo({ asc, desc, from, size });
            debug(sql, values);
            return this.query(sql, values).then(result => {
                return result[0].map(item => {
                    return this._setModelInfo(model, item, info);
                });
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    search(model, { asc = [], desc = [], between = {}, like = {}, from = 0, size = 10 } = {}) {

    }

    update(model) {
        if (model instanceof Model) {
            let { sql, values } = model.getUpdateSqlInfo();
            debug(sql, values);
            return this.query(sql, values).then(result => {
                return model;
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    insert(model) {
        if (model instanceof Model) {
            let { sql, values } = model.getInsertSqlInfo();
            debug(sql, values);
            return this.query(sql, values).then(result => {
                return model;
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    remove(model) {
        if (model instanceof Model) {
            let { sql, values } = model.getRemoveSqlInfo();
            debug(sql, values);
            return this.query(sql, values).then(result => {
                return model;
            });
        } else {
            return Promise.reject('model needed');
        }
    }

    _setModelInfo(model, values = {}, info) {
        let fieldTypes = (info.fieldTypes || {}), fieldMap = info.fieldMap, r = {};
        Reflect.ownKeys(values || {}).forEach(key => {
            let value = values[key];
            let gene = fieldTypes[key];
            if (gene) {
                if (typeof gene === 'function') {
                    gene = gene();
                }
                if (gene.parse) {
                    value = gene.parse(value);
                }
            }
            r[fieldMap[key].key] = value;
        });
        return Object.assign(new model.__proto__.constructor(), r);
    };
}

module.exports = MySqlDao;