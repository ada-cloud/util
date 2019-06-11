const uuid = require("uuid/v4");
const Types = require("./types");
class Model {
    constructor(data = {}) {
        Object.assign(this, data);
    }

    static configure() {
        return {
            table: '',
            prefix: '',
            fields: {
                id: { prime: true, field: 'id' }
            }
        }
    }

    getUpdateSqlInfo() {
        let info = this.getTableBaseInfo();
        let { table, primeKey, values } = info;
        let b = Reflect.ownKeys(values).filter(a => a !== primeKey.field),
            _val = b.map(a => `${a}=?`),
            _values = b.map(a => values[a]);
        let sql = `UPDATE ${table} SET ${_val.join(",")} WHERE ${primeKey.field}=?`;
        _values.push(values[primeKey.field]);
        return { sql, values: _values, info };
    }

    getInsertSqlInfo() {
        let info = this.getTableBaseInfo();
        let { table, values, primeKey } = info;
        if (values[primeKey.field] === undefined) {
            let id = uuid().replace(/-/g, '');
            values[primeKey.field] = id;
            this[primeKey.key] = id;
        }
        let b = Reflect.ownKeys(values), _val = b.map(a => `?`), _values = b.map(a => values[a]);
        let sql = `INSERT INTO ${table}(${b.join(",")}) VALUE(${_val.join(",")})`;
        return { sql, values: _values, info };
    }

    getQuerySqlInfo() {
        let info = this.getTableBaseInfo();
        let { table, values, fieldNames } = info;
        let b = Reflect.ownKeys(values), where = b.map(a => `${a}=?`), _values = b.map(a => values[a]);
        let sql = '';
        if (where.length > 0) {
            sql = `SELECT ${fieldNames.join(",")} FROM ${table} WHERE ${where.join(' and ')}`;
        } else {
            sql = `SELECT ${fieldNames.join(",")} FROM ${table}`;
        }
        return { sql, values: _values, info }
    }

    getQuerySqlCountInfo() {
        let info = this.getTableBaseInfo();
        let { table, values } = info;
        let b = Reflect.ownKeys(values), where = b.map(a => `${a}=?`), _values = b.map(a => values[a]);
        let sql = '';
        if (where.length > 0) {
            sql = `SELECT COUNT(*) FROM ${table} WHERE ${where.join(' and ')}`;
        } else {
            sql = `SELECT COUNT(*) FROM ${table}`;
        }
        return { sql, values: _values, info }
    }

    getQueryOrderSqlInfo({ asc = [], desc = [] } = {}) {
        let { sql, values, info } = this.getQuerySqlInfo();
        let { fields } = info;
        let _asc = asc.map(a => `${fields[a].field} ASC`).join(","),
            _desc = desc.map(a => `${fields[a].field} DESC`).join(",");
        let query = sql;
        if (asc.length > 0 || desc.length > 0) {
            sql = `${sql} ORDER BY ${_asc},${_desc}`;
        }
        return { sql, query, values, info };
    }

    getQueryLimitSqlInfo(from = 0, size = 10) {
        let { sql, values, info } = this.getQuerySqlInfo();
        let query = sql;
        sql = `${sql} limit ${from},${size}`;
        return { query, sql, values, info };
    }

    getQueryOrderLimitSqlInfo({ asc = [], desc = [], from = 0, size = 10 }) {
        let { sql, values, info } = this.getQueryOrderSqlInfo();
        let query = sql;
        sql = `${sql} limit ${from},${size}`;
        return { query, sql, values, info };
    }

    getRemoveSqlInfo() {
        let info = this.getTableBaseInfo();
        let { table, values } = info;
        let b = Reflect.ownKeys(values), where = b.map(a => `${a}=?`), _values = b.map(a => values[a]);
        let sql = '';
        if (where.length > 0) {
            sql = `DELETE FROM ${table} WHERE ${where.join(' and ')}`;
        } else {
            sql = `DELETE FROM ${table}`;
        }
        return { sql, values: _values, info };
    }

    getTableBaseInfo() {
        let construct = this.__proto__.constructor;
        let config = (typeof construct.configure === 'function' ? construct.configure() : construct.configure);
        let { fields, prefix = '', table } = config;
        let cols = {}, primeKey = null, keys = [], values = {}, fieldNames = [], fieldTypes = {}, fieldMap = {};
        let _colsList = Reflect.ownKeys(fields).map(key => {
            let { prime, field, type } = fields[key], _val = this[key];
            let a = { prime, field: (field ? `${prefix}${field}` : `${prefix}${key}`), type, key };
            if (prime) {
                primeKey = a;
            }
            if (_val !== undefined) {
                let gene = Types[a.type];
                if (gene) {
                    if (typeof gene === 'function') {
                        gene = gene();
                    }
                    if (gene.stringify) {
                        _val = gene.stringify(_val);
                    }
                }
                values[a.field] = _val;
            }
            cols[key] = a;
            fieldMap[a.field] = a;
            keys.push(key);
            fieldTypes[a.field] = a.type;
            fieldNames.push(a.field);
            return a;
        });
        return {
            table,
            fields: cols,
            fieldMap,
            fieldsList: _colsList,
            fieldTypes,
            primeKey,
            keys,
            values,
            fieldNames
        };
    }

    getPainObject() {
        let construct = this.__proto__.constructor;
        let config = (typeof construct.configure === 'function' ? construct.configure() : construct.configure);
        let { fields } = config, result = {};
        Reflect.ownKeys(fields).map(key => {
            result[key] = this[key];
        });
        return result;
    }
}

module.exports = Model;