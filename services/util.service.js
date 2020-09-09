const { to } = require('await-to-js');
const pe = require('parse-error');

module.exports = {
    to: async (promise) => {
        let err, res;
        [err, res] = await to(promise);
        if (err) {
            return [pe(err)];
        }

        return [null, res];
    },
    ReE: function (res, err, code) {
        // Error Web Response
        if (typeof err === 'object' && typeof err.message !== 'undefined') {
            err = err.message;
        }

        if (typeof code !== 'undefined') {
            res.statusCode = code;
        }

        return res.json({ success: false, error: err });
    },
    ReS: function (res, data, code) {
        // Success Web Response
        let sendData = { success: true };

        if (typeof data === 'object') {
            sendData = Object.assign(data, sendData); //merge the objects
        }

        if (typeof code !== 'undefined') {
            res.statusCode = code;
        }

        return res.json(sendData);
    },
    TE: function (errMessage, log) {
        // TE stands for Throw Error
        if (log === true) {
            console.error(errMessage);
        }

        throw new Error(errMessage);
    },
};
