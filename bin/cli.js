#!/usr/bin/env node
let { Commander } = require("ada-util");
let commander = new Commander();
commander.cmds([
    require("./cmd/version"),
    require("./cmd/init"),
    require("./cmd/boost")
]);
commander.call(process.argv.slice(2));