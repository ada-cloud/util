const { Controller } = require("ada-cloud-util/boost");

class ${upperTableCamelName}Controller extends Controller {
    static configure = {
        basePath: "/role",
        actions: {
            get${upperTableCamelName}List: { path: "/list", method: "get" },
            add${upperTableCamelName}: { path: "/add", method: "post" },
            edit${upperTableCamelName}: { path: "/edit", method: "post" },
            remove${upperTableCamelName}: { path: "/remove", method: "post" }
        },
        service: '${tableCamelName}Service'
    }

    get${upperTableCamelName}List({ request }) {
        let { from, size } = request.query;
        return this.${tableCamelName}Service.get${upperTableCamelName}List(from, size).then(a => this.success(a));
    }

    add${upperTableCamelName}({ request }) {
        return this.${tableCamelName}Service.add${upperTableCamelName}(request.body).then(a => this.success(a));
    }

    edit${upperTableCamelName}({ request }) {
        return this.${tableCamelName}Service.edit${upperTableCamelName}(request.body).then(a => this.success(a));
    }

    remove${upperTableCamelName}({ request }) {
        return this.${tableCamelName}Service.remove${upperTableCamelName}(request.body).then(a => this.success(a));
    }
}

module.exports = RoleController;