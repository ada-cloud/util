const { Model, Types } = require("ada-cloud-util/boost");

class ${upperTableCamelName}Model extends Model {
    static configure = {
        table: '${tableName}',
        fields: ${fields}
    }
}

module.exports = RoleModel;