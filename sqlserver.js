const config = require('./config.json');
const mysql = require("mysql2");

const connection = mysql.createConnection(config.sqlserver);

connection.connect(function(err){
  if (err) { return console.error("Ошибка: " + err.message); }
  else{ console.log("Подключение к серверу MySQL успешно установлено"); }
});

module.exports = connection;