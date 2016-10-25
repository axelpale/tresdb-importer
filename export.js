var mysql = require('mysql');
var local = require('./config/local');
var jsonfile = require('jsonfile');
var lib = require('./lib');

// Setup connection

var connection = mysql.createConnection(local.locator_db);

var exit = function (err) {
  if (err) {
    console.error(err);
  }

  return connection.end();
};

connection.connect(function (err) {
  if (err) {
    return exit(err);
  }

  console.log('connected as id ' + connection.threadId);

  lib.v3.export(connection, function (err2, result) {
    if (err2) {
      return exit(err2);
    }

    var opts = { spaces: 2 };

    jsonfile.writeFile('./data/dump.json', result, opts, function (err3) {
      if (err3) {
        return exit(err3);
      }
      console.log('Locator successfully dumped to data/dump.json');

      return exit();
    });

  });

});
