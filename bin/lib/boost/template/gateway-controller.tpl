const { Controller } = require("ada-cloud-util/boost");

class ${upperTableCamelName}Controller extends Controller {
    static configure = {
        basePath: "/api/${url}",
        actions: {
            get${upperTableCamelName}List: { path: "/list", method: "get" },
            add${upperTableCamelName}: { path: "/add", method: "post" },
            edit${upperTableCamelName}: { path: "/edit", method: "post" },
            remove${upperTableCamelName}: { path: "/remove", method: "post" }
        }
    }

    get${upperTableCamelName}List() {
        return this.service.get('/${name}/${url}/list');
    }

    add${upperTableCamelName}({ request }) {
        return this.service.post('/${name}/${url}/add', request.body);
    }

    edit${upperTableCamelName}({ request }) {
        return this.service.post('/${name}/${url}/edit', request.body);
    }

    remove${upperTableCamelName}({ request }) {
        return this.service.post('/${name}/${url}/remove', request.body);
    }
}

module.exports = ${upperTableCamelName}Controller;