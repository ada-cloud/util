require("colors");
let map = require("./../../package.json");
module.exports = {
	command: "version",
	desc: "version",
	paras: [],
	fn: function () {
		console.log(`[CLOUD-BOOT] VERSION ${map.version}`.yellow);
	}
};