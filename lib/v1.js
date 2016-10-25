
var _ = require('lodash');

exports.export = function (db, callback) {
  // Export from Locator.
  //
  // Parameters
  //   db
  //     MySQL connection
  //   callback
  //     function (err, result)
  //

  // Aggregate. Store here the converted data from Locator.

  var result = {};

  // Fetch locations

  var loc2location = function (row) {
    return {
      _id: row.loc_id,
      name: row.loc_name,
      lat: row.loc_lat,
      lng: row.loc_lon,
    };
  };

  var sql = 'SELECT * FROM locs';

  db.query(sql, function (err, rows) {
    if (err) {
      return callback(err);
    }

    result.locations = _.map(rows, loc2location);

    return callback(null, result);
  });

};

exports.import = function (db, dump, callback) {
  // Import to TresDB

  var locations = db.collection('locations');

  var dumploc2mongoloc = function (loc) {
    return {
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      locator_id: loc._id,  // eslint-disable-line camelcase
    };
  };

  var locsToInsert = _.map(dump.locations, dumploc2mongoloc);

  locations.insertMany(locsToInsert, function (err, result) {
    if (err) {
      return callback(err);
    }

    var n = result.result.n;

    console.log(n + ' locations inserted successfully');

    return callback();
  });
};
