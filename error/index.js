class CloudError extends Error {
    constructor(...args) {
        super(...args);
    }
}

module.exports = CloudError;