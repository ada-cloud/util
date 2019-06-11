const { SyncFile, File } = require("ada-util");
const Path = require("path");
const mysql = require("mysql2");

const BoostUtil = {
    getConfig(path) {
        if (!path) {
            path = Path.resolve(process.cwd(), './ada-cloud-boost-config.json');
        }
        return require(path);
    },
    getTableInfo() {
        return new Promise((resolve, reject) => {
            let { host, user, port, password, database, charset } = this.getConfig();
            const connection = mysql.createConnection({
                host, user, port, password, database, charset
            });
            connection.query('show tables', (err, results) => {
                if (!err) {
                    let tables = results.map(a => a[`Tables_in_${database}`]).filter(a => !!a), map = {};
                    return tables.reduce((a, tableName) => {
                        return a.then(() => {
                            return new Promise((resolve, reject) => {
                                connection.query('show full columns from `' + tableName + '`', (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        result = result.map(a => {
                                            return {
                                                Field: a.Field,
                                                Type: a.Type,
                                                Collation: a.Collation,
                                                Null: a.Null,
                                                Key: a.Key,
                                                Default: a.Default,
                                                Extra: a.Extra,
                                                Privileges: a.Privileges,
                                                Comment: a.Comment
                                            }
                                        });
                                        map[tableName] = result;
                                        resolve(result);
                                    }
                                });
                            });
                        });
                    }, Promise.resolve()).then(() => {
                        connection.close();
                        resolve(map);
                    });
                } else {
                    reject(err);
                }
            });
        });
    },
    getFileContent(type) {
        let path = Path.resolve(__dirname, `./template/${type}.tpl`);
        return new SyncFile(path).read();
    },
    parseTemplate(type, info) {
        return this.getFileContent(type).replace(/\$\{[\s\S]+?\}/g, str => {
            return info[str.substring(2, str.length - 1)];
        });
    },
    getCamelName(name) {
        let camelName = name.replace(/_[a-zA-Z]/g, str => {
            return str.substring(1).toUpperCase();
        });
        let upperCamelName = camelName.substring(0, 1).toUpperCase() + camelName.substring(1, camelName.length);
        return { camelName, upperCamelName }
    },
    getFieldsString(fields) {
        let t = '{\n', q = [];
        Reflect.ownKeys(fields).forEach(name => {
            let m = '';
            m += `            ${name}: {`, f = [];
            Reflect.ownKeys(fields[name]).forEach(key => {
                f.push(` ${key}: ${fields[name][key]}`);
            });
            m += f.join(",");
            m += ` }`;
            q.push(m);
        });
        t += q.join(",\n");
        t += '\n        }';
        return t;
    },
    output(path) {
        let { output, name } = this.getConfig(path);
        return this.getTableInfo().then(tableMap => {
            return Reflect.ownKeys(tableMap).map(tableName => {
                let { camelName, upperCamelName } = this.getCamelName(tableName);
                let fields = {};
                tableMap[tableName].forEach(item => {
                    if (item.Key === "PRI") {
                        fields['id'] = {
                            prime: true,
                            type: 'Types.STRING',
                            field: item.Field
                        };
                    } else {
                        let { camelName } = this.getCamelName(item.Field);
                        fields[camelName] = {
                            field: item.Field,
                            type: 'Types.STRING',
                        };
                    }
                })
                return {
                    tableName,
                    url: tableName.replace(/_/g, ''),
                    tableCamelName: camelName,
                    upperTableCamelName: upperCamelName,
                    fields: this.getFieldsString(fields)
                }
            }).reduce((a, table) => {
                return a.then(() => {
                    let { tableName, tableCamelName, upperTableCamelName, fields, url } = table;
                    return Promise.resolve().then(() => {
                        let content = this.parseTemplate('controller', { tableName, tableCamelName, upperTableCamelName, fields, url, name });
                        return new File(Path.resolve(output, `./controller/${tableName}.js`)).write(content);
                    }).then(() => {
                        let content = this.parseTemplate('model', { tableName, tableCamelName, upperTableCamelName, fields, url, name });
                        return new File(Path.resolve(output, `./model/${tableName}.js`)).write(content);
                    }).then(() => {
                        let content = this.parseTemplate('service', { tableName, tableCamelName, upperTableCamelName, fields, url, name });
                        return new File(Path.resolve(output, `./service/${tableName}.js`)).write(content);
                    }).then(() => {
                        let content = this.parseTemplate('gateway-controller', { tableName, tableCamelName, upperTableCamelName, fields, url, name });
                        return new File(Path.resolve(output, `./gateway/${tableName}-js`)).write(content);
                    });
                });
            }, Promise.resolve());
        });
    }
};

module.exports = BoostUtil;