let colors = require("colors");
let download = require("download-git-repo");
let { SyncFile } = require("ada-util");
let Path = require("path");
let ora = require('ora');

const map = {
	web: "template-service-of-web",
	exter:"template-service-of-exter",
	inter: "template-service-of-inter",
	config: "template-service-of-config",
	hub: "template-service-of-hub"
};

module.exports = {
	command: "init",
	desc: "init project",
	paras: ["name", "type"],
	fn: function (parameters) {
		let name = parameters[0], type = parameters[1], path = process.cwd();
		if (parameters.length === 1) {
			type = name;
			name = "";
		}
		if (!map[type]) {
			type = "template-service-of-web";
		} else {
			type = map[type];
		}
		let spinner = ora('Download template project').start();
		download(`ada-cloud/${type}`, path, function (err) {
			if (err) {
				spinner.fail(`download error`);
			} else {
				spinner.stop();
				if (name) {
					let packagePath = Path.resolve(path, "./package.json"),
						configPath = Path.resolve(path, "./app.config.json");
					let package = new SyncFile(packagePath),
						config = new SyncFile(configPath);
					if (package.exist) {
						let info = require(packagePath);
						info.name = name;
						package.write(JSON.stringify(info, null, 4));
					} else {
						package.write(JSON.stringify({ name }, null, 4));
					}
					if (config.exist) {
						let info = require(configPath);
						info.name = name;
						config.write(JSON.stringify(info, null, 4));
					} else {
						package.write(JSON.stringify({
							name,
							protocol: "http:",
							host: "localhost",
							port: "6102",
							cloudHub: "",
							username: "",
							password: ""
						}, null, 4));
					}
				}
				console.log(`Project is ready!`.yellow);
			}
		});
	}
};