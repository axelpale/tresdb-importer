var mysql = require('mysql');
var local = require('./config/local');
var _ = require('lodash');
var jsonfile = require('jsonfile');

// Setup connection

var connection = mysql.createConnection({
  host: local
});

connection.connect();

// Aggregate. Store here the converted data from Locator.

var result = {};

// Fetch locations

var loc2location = function (row) {
  return {
    _id: row.loc_id,
    name: loc_name,
    lat: loc_lat,
    lng: loc_lon
  }
};

var sql = 'SELECT * FROM locs';
connection.query(sql, function (err, rows, fields) {
  if (err) throw err;

  result.locations = _.map(rows, loc2location);
});

// Store result as JSON

jsonfile.writeFile('./data/dump.json', result, {spaces: 2}, function (err) {
  if (err) throw err;
  console.log('Locator successfully dumped to data/dump.json');
});

// Close connection

connection.end();
