const { Service } = require("ada-cloud-util/boost");
const ${upperTableCamelName}Model = require("./../model/${tableName}");

class ${upperTableCamelName}Service extends Service {
    static configure() {
        return {
            name: "${tableCamelName}Service",
            dao: 'boost',
            methods: {
                get${upperTableCamelName}List: { transaction: false },
                add${upperTableCamelName}: { transaction: true },
                edit${upperTableCamelName}: { transaction: true },
                remove${upperTableCamelName}: { transaction: true }
            }
        }
    }

    get${upperTableCamelName}List(from, size) {
        let ${tableCamelName} = new ${upperTableCamelName}Model();
        return this.dao.findPage(${tableCamelName}, from, size);
    }

    add${upperTableCamelName}(info) {
        let ${tableCamelName} = new ${upperTableCamelName}Model(info);
        return this.dao.insert(${tableCamelName});
    }

    edit${upperTableCamelName}(info) {
        let ${tableCamelName} = new ${upperTableCamelName}Model(info);
        return this.dao.update(${tableCamelName});
    }

    remove${upperTableCamelName}({ id }) {
        let ${tableCamelName} = new ${upperTableCamelName}Model({ id });
        return this.dao.remove(${tableCamelName});
    }
}

module.exports = RoleService;