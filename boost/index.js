const Router = require("./lib/router");
const Controller = require("./base/controller");
const Dao = require("./base/dao");
const Service = require("./base/service");
const Model = require("./base/model");
const Datasource = require("./datasource");
const MysqlDatasource = require("./datasource/mysql");
const MysqlDao = require("./base/dao/mysql");
const Types = require("./base/types");
const { File } = require("ada-util");
const Path = require("path");
const { Result, ErrorResult, NofoundResult } = require("./../result");
const { debug } = require("./../const");

const DaoMap = {
    map: new Map(),
    get(name) {
        return this.map.get(name);
    },
    set(clazz) {
        if (clazz.configure) {
            let config = (typeof clazz.configure === 'function' ? clazz.configure() : clazz.configure);
            if (config.name) {
                this.map.set(config.name, clazz);
            }
        }
    }
}

const ServiceMap = {
    map: new Map(),
    get(name) {
        return this.map.get(name);
    },
    set(clazz) {
        if (clazz.configure) {
            let config = clazz.configure();
            if (config.name) {
                config.targetClass = clazz;
                this.map.set(config.name, config);
            }
        }
    }
}

const ControllerMap = {
    router: new Router(),
    set(clazz) {
        if (clazz.configure) {
            let { basePath = '', actions = {} } = (typeof clazz.configure === 'function' ? clazz.configure() : clazz.configure), controller = clazz;
            Reflect.ownKeys(actions).forEach(key => {
                let actionInfo = actions[key];
                let { path = '', method = 'get' } = actionInfo;
                let _path = `/${method}/${basePath}/${path}`.replace(/[\/]+/g, '/');
                this.router.add(_path, {
                    action: key,
                    actionInfo,
                    controller
                });
            });
        }
    }
}

const DatasourceMap = {
    map: new Map(),
    get(type) {
        return this.map.get(type);
    },
    set(clazz) {
        if (clazz.configure) {
            let config = (typeof clazz.configure === 'function' ? clazz.configure() : clazz.configure);
            if (config.name) {
                this.map.set(config.name, clazz);
            }
        }
    }
}

const DatasourceInstance = {
    map: new Map(),
    set(name, instance) {
        this.map.set(name, instance);
    },
    get(name) {
        return this.map.get(name);
    }
}

const BoostContext = {
    source: '',
    server: null,
    info: {},
    setContextInfo(info) {
        this.info = info || {};
    }
};

const Boost = {
    boot({ source, server }) {
        BoostContext.server = server;
        BoostContext.source = source;
        DaoMap.set(MysqlDao);
        DatasourceMap.set(MysqlDatasource);
        return new File(source).getAllSubFilePaths().then(paths => {
            paths.filter(path => Path.extname(path) === ".js").forEach(path => {
                let clazz = require(path);
                if (clazz.prototype instanceof Service) {
                    ServiceMap.set(clazz);
                } else if (clazz.prototype instanceof Dao) {
                    DaoMap.set(clazz);
                } else if (clazz.prototype instanceof Controller) {
                    ControllerMap.set(clazz);
                } else if (clazz.prototype instanceof Datasource) {
                    DatasourceMap.set(clazz);
                }
            });
        }).then(() => {
            let ps = Promise.resolve();
            DatasourceMap.map.forEach((datasource, name) => {
                let ops = server.getDatabaseOption(name);
                if (ops && Reflect.ownKeys(ops).length > 0) {
                    let _datasource = new datasource();
                    DatasourceInstance.set(name, _datasource);
                    ps = ps.then(() => {
                        return Promise.resolve().then(() => _datasource.initialize(ops));
                    });
                }
            });
            return ps.then(() => {
                server.use((ctx, next) => {
                    let path = `/${ctx.method.toLowerCase()}${ctx.path}`;
                    let r = ControllerMap.router.check(path);
                    if (r && r.found) {
                        let { action, controller, actionInfo } = r.callback;
                        let controllerInstance = new controller();
                        ctx.parameters = r.map;
                        let { service = [] } = (typeof controller.configure === 'function' ? controller.configure() : controller.configure);
                        if (typeof service === 'string') {
                            service = [service];
                        }
                        let nofound = [];
                        service.forEach(propName => {
                            let _service = BoostProvider.getService(propName);
                            if (!_service) {
                                nofound.push(propName);
                            }
                            controllerInstance[propName] = _service;
                        });
                        if (nofound.length > 0) {
                            debug(`!! service can not found of [ ${nofound.join(",")} ]`);
                        }
                        if (controllerInstance[action]) {
                            controllerInstance.requestContext = ctx;
                            Object.assign(controllerInstance, BoostContext.info);
                            let _ps = Promise.resolve();
                            _ps = _ps.then(() => controllerInstance.beforeExcute({ context: ctx, action: actionInfo }));
                            _ps = _ps.then(result => {
                                if (result !== false) {
                                    return controllerInstance[action](ctx).then(a => {
                                        if (a && a instanceof Result) {
                                            ctx.set("Content-Type", "application/json");
                                            ctx.response.body = a.getResponseData();
                                        } else {
                                            ctx.response.body = a;
                                        }
                                    });
                                }
                            });
                            _ps = _ps.then(() => controllerInstance.afterExcute({ context: ctx, action: actionInfo }));
                            _ps = _ps.then(() => {
                                controllerInstance.requestContext = null;
                                return next();
                            }).catch(a => {
                                return Promise.resolve().then(() => controllerInstance.actionExcuteError({ context: ctx, action: actionInfo, error: a })).then(result => {
                                    if (result !== false) {
                                        ctx.set("Content-Type", "application/json");
                                        ctx.response.body = new ErrorResult(a).getResponseData();
                                        controllerInstance.requestContext = null;
                                        return next();
                                    } else {
                                        controllerInstance.requestContext = null;
                                        return next();
                                    }
                                }).catch(a => {
                                    ctx.set("Content-Type", "application/json");
                                    ctx.response.body = new ErrorResult(a).getResponseData();
                                    controllerInstance.requestContext = null;
                                    return next();
                                });
                            });
                            return _ps;
                        } else {
                            return Promise.resolve().then(() => controllerInstance.actionNotFound({ context: ctx, action: actionInfo })).then(result => {
                                if (result !== false) {
                                    controllerInstance.requestContext = null;
                                    ctx.set("Content-Type", "application/json");
                                    ctx.response.body = new NofoundResult('action can not found').getResponseData();
                                    return next();
                                } else {
                                    controllerInstance.requestContext = null;
                                    return next();
                                }
                            }).catch(a => {
                                return Promise.resolve().then(() => controllerInstance.actionExcuteError({ context: ctx, action: actionInfo, error: a })).then(result => {
                                    if (result !== false) {
                                        ctx.set("Content-Type", "application/json");
                                        ctx.response.body = new ErrorResult(a).getResponseData();
                                        controllerInstance.requestContext = null;
                                        return next();
                                    } else {
                                        controllerInstance.requestContext = null;
                                        return next();
                                    }
                                }).catch(a => {
                                    ctx.set("Content-Type", "application/json");
                                    ctx.response.body = new ErrorResult(a).getResponseData();
                                    controllerInstance.requestContext = null;
                                    return next();
                                });
                            });
                        }
                    }
                });
            });
        }).then(() => BoostContext);
    },
    update() {
        DatasourceInstance.map.forEach((instance, name) => {
            instance.update(BoostContext.server.getDatabaseOption(name));
        });
    }
}

BoostProvider = {
    getService(serviceName) {
        let mapInfo = ServiceMap.get(serviceName);
        if (mapInfo) {
            let { targetClass, dao, methods = {} } = mapInfo;
            let targetInstance = new targetClass();
            return new Proxy(targetInstance, {
                get(target, name) {
                    if (typeof target[name] === 'function') {
                        let action = methods[name] || {};
                        let { transaction = false } = action;
                        return (...args) => {
                            let promise = Promise.resolve(), map = new Map();
                            if (dao === undefined) {
                                if (transaction) {
                                    transaction = false;
                                }
                            } else {
                                if (typeof dao === 'string') {
                                    if (dao === 'boost') {
                                        dao = ['dao'];
                                    } else {
                                        dao = [dao];
                                    }
                                }
                                let nofound = [];
                                dao.forEach(keyName => {
                                    let daoName = keyName;
                                    let daoTarget = DaoMap.get(daoName);
                                    if (daoTarget) {
                                        let { datasource } = (typeof daoTarget.configure === 'function' ? daoTarget.configure() : daoTarget.configure);
                                        let _nofound = [];
                                        let _datasource = DatasourceInstance.get(datasource);
                                        if (_datasource) {
                                            promise = promise.then(() => {
                                                return _datasource.getConnection().then(connection => {
                                                    let _dao = new daoTarget();
                                                    _dao.connection = connection;
                                                    target[keyName] = _dao;
                                                    map.set(_datasource, connection);
                                                });
                                            });
                                        } else {
                                            _nofound.push(datasource);
                                        }
                                        if (_nofound.length > 0) {
                                            debug(`!! datasource can not found of [ ${_nofound.join(",")} ]`);
                                        }
                                    } else {
                                        nofound.push(keyName);
                                    }
                                });
                                if (nofound.length > 0) {
                                    debug(`!! dao can not found of [ ${nofound.join(",")} ]`);
                                }
                            }
                            return promise.then(() => {
                                let ps = Promise.resolve();
                                if (transaction) {
                                    ps = ps.then(() => {
                                        return [...map.values()].reduce((a, connection) => {
                                            return a.then(() => connection.beginTransaction());
                                        }, Promise.resolve()).then(() => {
                                            debug('start transaction');
                                        });
                                    });
                                }
                                return ps.then(() => {
                                    return new Promise((resolve, reject) => {
                                        let result = true, errorInfo = null, resultInfo = null;
                                        Promise.resolve().then(() => target.beforeExcute(action))
                                            .then(() => target[name].apply(target, args))
                                            .then(a => target.afterExcute({ result: a, action }))
                                            .then(a => {
                                                result = true;
                                                resultInfo = a;
                                                if (transaction) {
                                                    return [...map.values()].reduce((a, connection) => {
                                                        return a.then(() => connection.commit());
                                                    }, Promise.resolve()).then(() => {
                                                        debug('commit transaction');
                                                    });
                                                }
                                            }).catch(err => {
                                                result = false;
                                                errorInfo = err.message;
                                                if (transaction) {
                                                    return [...map.values()].reduce((a, connection) => {
                                                        return a.then(() => connection.rollback());
                                                    }, Promise.resolve()).then(() => {
                                                        debug('rollback transaction');
                                                    });
                                                }
                                            }).finally(a => {
                                                map.forEach((connection, datasource) => {
                                                    datasource.releaseConnection(connection);
                                                });
                                                if (result) {
                                                    resolve(resultInfo);
                                                } else {
                                                    reject(errorInfo);
                                                }
                                            });
                                    });
                                });
                            });
                        }
                    } else {
                        return target[name];
                    }
                }
            });
        } else {
            return null;
        }
    }
}

module.exports = {
    Service,
    Controller,
    Dao,
    Model,
    MysqlDatasource,
    MysqlDao,
    Types,
    Boost
};