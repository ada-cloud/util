require("colors");
const util = require('./../lib/boost');

module.exports = {
    command: "boost",
    desc: "boost util",
    paras: [],
    fn: function () {
        util.output().then(() => console.log('done'.green)).catch(e => console.log(e));
    }
};