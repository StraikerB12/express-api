const config = require('../config.json');
const connection = require('../sqlserver');
const crypto = require('crypto');


const hashGeneration = (password, secret, key = '') => {
    return crypto.createHmac('sha256', `${password}${key}${Date.now()}` ).update(secret).digest('hex');
};


const signup = (req, res) => {
    if(!req.body) return res.sendStatus(400);
  
    const {email, password} = req.body;
    
    const time_token = Date.now() + config.time_token_set;
    const hash = hashGeneration(password, config.pasword_secret);
    const bearer_token = hashGeneration(password, config.bearer_token_secret, email);
    const refresh_token = hashGeneration(password, config.refresh_token_secret, email);
  
    connection.query(
        "INSERT INTO users (email, password, time_token, bearer_token, refresh_token) VALUES (?,?,?,?,?)", 
        [email, hash, time_token, bearer_token, refresh_token], 
        function(err, data) {
            if(err) return console.log(err);
        }
    );
    
    res.send({bearer_token,refresh_token,time_token});
}


const signin = (req, res) => {
    if(!req.body) return res.sendStatus(400);
  
    const {email, password} = req.body;
    const hash = crypto.createHmac('sha256', password).update('suprize').digest('hex');
  
    connection.query("SELECT * FROM users WHERE email=?", [email], function(err, data) {
        if(err) return console.log(err);
        
        if(data.length == 0) return res.sendStatus(403);
        if(data[0].password != hash) return res.sendStatus(403);
    
        const time_token = Date.now() + config.time_token_set;
        const bearer_token = hashGeneration(password, config.bearer_token_secret, email);
        const refresh_token = hashGeneration(password, config.refresh_token_secret, email);
        
        connection.query(
            "UPDATE users SET bearer_token=?, refresh_token=?, time_token=? WHERE email=?", 
            [bearer_token, refresh_token, time_token, email], 
            function(err, data) {
                if(err) return console.log(err);
            }
        );
        
        res.send({bearer_token, refresh_token, time_token});
    });
}


const new_token = (req, res) => {
    connection.query("SELECT * FROM users WHERE refresh_token=?", [req.body.refresh_token], function(err, data) {
        if(err) return console.log(err);
        if(data.length == 0) return res.sendStatus(403);

        const {password, email} = data[0];
        const time_token = Date.now() + config.time_token_set;
        const bearer_token = hashGeneration(password, config.bearer_token_secret, email);

        connection.query(
            "UPDATE users SET bearer_token=?, time_token=? WHERE refresh_token=?", 
            [bearer_token, time_token, req.body.refresh_token], 
            function(err, data) {
                if(err) return console.log(err);
            }
        );
        
        res.send({bearer_token, time_token});
    });
}


const logout = (req, res) => {
    connection.query(
        "UPDATE users SET time_token=? WHERE id=?", 
        [0, req.userId], 
        function(err, data) {
        if(err) return console.log(err);
            res.sendStatus(200);
        }
    );
}


module.exports = {
    new_token,
    logout,
    signin,
    signup
};