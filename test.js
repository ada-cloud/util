// const uuid = require("uuid/v4");
// console.log(uuid().replace(/-/g, ''));
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: '',
    port: '',
    database: '',
    user: '',
    password: ''
});
connection.query('show tables', (err, results, fields) => {
    let tables = results.map(a => a).filter(a => !!a);
    let map = {};
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
        console.log(map);
        connection.close();
        return map;
    });
});