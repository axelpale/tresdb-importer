
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
      name: row.loc_name,
      geom: {
        type: 'Point',
        coordinates: [row.loc_lon, row.loc_lat],
      },
      locator_id: row.loc_id,  // eslint-disable-line camelcase

      // Dummy values for clustering. Set here so that the keys exist.
      // Values do not need to mean anything.
      neighborsAvgDist: 1000,
      layer: 15,
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

  locations.insertMany(dump.locations, function (err, result) {
    if (err) {
      return callback(err);
    }

    var n = result.result.n;

    console.log(n + ' locations inserted successfully');

    return callback();
  });
};
