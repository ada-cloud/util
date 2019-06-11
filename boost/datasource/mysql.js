const mysql = require('mysql2');
const Datasource = require("./index");

class MySqlDatasource extends Datasource {
    static configure() {
        return {
            name: "defaultMysqlDatasource"
        }
    }

    initialize(option) {
        this.pool = mysql.createPool(option);
    }

    getConnection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    reject();
                } else {
                    resolve(conn.promise());
                }
            });
        });
    }

    releaseConnection(connection) {
        this.pool.releaseConnection(connection.connection);
    }

    update(config) {
        this.pool.end(err => {
            this.pool = mysql.createPool(config);
        });
    }
}

module.exports = MySqlDatasource;