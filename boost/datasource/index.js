class Datasource {
    static configure() {
        return {
            name: ''
        }
    }

    getConnection() { }

    releaseConnection() { };

    initialize(option) { }

    update(option) { }
}

module.exports = Datasource;