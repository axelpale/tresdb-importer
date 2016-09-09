var mysql = require('mysql');
var local = require('./config/local');
var _ = require('lodash');
var jsonfile = require('jsonfile');

// Setup connection

var connection = mysql.createConnection(local.locator_db);

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

// Aggregate. Store here the converted data from Locator.

var result = {};

// Fetch locations

var loc2location = function (row) {
  return {
    _id: row.loc_id,
    name: row.loc_name,
    lat: row.loc_lat,
    lng: row.loc_lon
  }
};

var sql = 'SELECT * FROM locs';
connection.query(sql, function (err, rows, fields) {
  if (err) throw err;

  result.locations = _.map(rows, loc2location);

  // Store result as JSON

  jsonfile.writeFile('./data/dump.json', result, {spaces: 2}, function (err) {
    if (err) throw err;
    console.log('Locator successfully dumped to data/dump.json');
  });
});


// Close connection

connection.end();
