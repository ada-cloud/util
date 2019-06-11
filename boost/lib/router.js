class Router {
    constructor(context) {
        this.map = [];
        this.list = [];
        this.hasDot = /\{\w*\}/g;
        this.url = '';
    }

    add(path, fn) {
        if (path[path.length - 1] !== "/") {
            path = path + "/";
        }
        let has = false, count = 0, start = 0, pars = [];
        let pathx = path.replace(this.hasDot, function (a, b) {
            has = true;
            if (count === 0) {
                start = b;
            }
            pars.push(a.substring(1, a.length - 1));
            count++;
            return "((?!/).)*";
        });
        if (has) {
            let info = {};
            info.originalpath = path;
            info.pattern = new RegExp("^" + pathx + "$");
            info.count = count;
            info.patternString = "^" + pathx + "/$";
            info.firstposition = start;
            info.keys = pars;
            info.callback = fn;
            let aStrings = path.split("\\.");
            if (aStrings.length > 1) {
                info.suffix = aStrings[1];
            }
            this.list.push(info);
        } else {
            this.map[path] = fn;
        }
    }

    check(path) {
        let result = {
            found: false,
            hasParas: false,
            path: path,
            matchpath: "",
            map: {},
            callback: null
        };
        let t = path.split("?");
        if (t.length > 1) {
            path = t[0];
        }
        let suffix = "", bString = path.split("\\.");
        if (bString.length > 1) {
            suffix = bString[1];
            path = path + "/";
        } else {
            if (bString[0][bString[0] - 1] !== "/") {
                path = bString[0] + "/";
            }
        }
        if (this.map[path]) {
            result.path = path;
            result.matchpath = path;
            result.callback = this.map[path];
            result.found = true;
            return result;
        } else {
            let a = null;
            for (let i in this.list) {
                let info = this.list[i];
                if (info.pattern.test(path)) {
                    if (null === a) {
                        a = info;
                    } else if (info.suffix === suffix) {
                        if (info.count <= a.count) {
                            if (info.firstposition > a.firstposition) {
                                a = info;
                            }
                        }
                    }
                }
            }
            if (null !== a) {
                let p = path.split("/"), pp = a.originalpath.split("/");
                let cd = 0;
                for (let i = 0; i < pp.length; i++) {
                    if (pp[i][0] === "{") {
                        result.map[a.keys[cd]] = p[i];
                        cd++;
                    }
                }
                result.hasParas = true;
                result.path = a.originalpath;
                result.matchpath = path;
                result.callback = info.callback;
                result.found = true;
            }
            return result;
        }
    }
}

module.exports = Router;