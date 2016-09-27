var MongoClient = require('mongodb').MongoClient;
var jsonfile = require('jsonfile');
var _ = require('lodash');
var local = require('./config/local');

var mongoUrl = function (config) {
  var u = config.user;
  var pwd = config.password;
  var h = config.host;
  var p = config.port;
  var d = config.database;
  return 'mongodb://' + u + ':' + pwd + '@' + h + ':' + p + '/' + d;
};

var url = mongoUrl(local.tresdb_db);

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Connected correctly to server");

  var locations = db.collection('locations');

  var dumploc2mongoloc = function (loc) {
    // Maybe unnecessary function.
    return {
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      locator_id: loc._id
    };
  };

  // Read locations from the dump
  jsonfile.readFile('./data/dump.json', function (err, obj) {
    if (err) throw err;

    var locsToInsert = _.map(obj.locations, dumploc2mongoloc);
    locations.insertMany(locsToInsert, function (err, result) {
      if (err) throw err;

      var n = result.result.n;
      console.log(n + ' locations inserted successfully');

      // Important to close after everything else. Close during insertion
      // leads to error 'server instance pool was destroyed'.
      db.close();
    });
  });
});
