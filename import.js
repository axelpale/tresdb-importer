var MongoClient = require('mongodb').MongoClient;
var jsonfile = require('jsonfile');
var local = require('./config/local');
var lib = require('./lib');

var mongoUrl = function (config) {
  var u = config.user;
  var pwd = config.password;
  var h = config.host;
  var p = config.port;
  var d = config.database;

  return 'mongodb://' + u + ':' + pwd + '@' + h + ':' + p + '/' + d;
};

var url = mongoUrl(local.tresdb_db);

MongoClient.connect(url, function (err, db) {
  if (err) {
    throw err;
  }

  console.log('Connected correctly to server');

  // Important to close after everything else. Close during insertion
  // leads to error 'server instance pool was destroyed'.
  var exit = function (err2) {
    if (err2) {
      console.error(err2);
    }

    return db.close();
  };

  // Read locations from the dump
  jsonfile.readFile('./data/dump.json', function (err3, obj) {
    if (err3) {
      return exit(err3);
    }

    lib.v3.import(db, obj, function (err4) {
      return exit(err4);
    });
  });
});
