const config = require('../config.json');
const connection = require('../sqlserver');

module.exports = (req, res, next) => {
    if (!req.headers.authorization) return res.sendStatus(403);
    if (req.headers.authorization.split(' ')[0] !== 'Bearer') return res.sendStatus(403);

    const token = req.headers.authorization.split(' ')[1];

    connection.query("SELECT * FROM users WHERE bearer_token=?", [token], function(err, data) {
        if(err) return console.log(err);
        if(data.length == 0) return res.sendStatus(403);
        if(data[0].time_token < Date.now()) return res.sendStatus(403);

        req.userId = data[0].id;
        req.userKey = data[0].email;

        connection.query("UPDATE users SET time_token=? WHERE bearer_token=?" , [Date.now() + config.time_token_set, token], function(err, data) {
        if(err) return console.log(err);
        });
        next();
    });
};