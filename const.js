const md5 = require("md5");
const debug = require("debug");

const PASSWORDSECRITCODE = 'cloudhub_password_decrypt_screct_code';
module.exports = {
    PASSWORD(password) {
        return md5(`#${password}#${PASSWORDSECRITCODE}`);
    },
    CACHEID({ protocol, host, port, name }) {
        return md5(`${protocol}//${host}:${port}/${name}`);
    },
    debug: debug('ADA:CLOUD-HUB')
};