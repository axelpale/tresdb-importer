
var _ = require('lodash');
var async = require('async');
var mime = require('mime');

var infoToMarkdown = require('./conversions/infoToMarkdown');
var statusToTags = require('./conversions/statusToTags');
var classToTags = require('./conversions/classToTags');

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

    // Ensure the coordinates are within required range.
    var lng = Math.max(Math.min(row.loc_lon, 180), -180);
    var lat = Math.max(Math.min(row.loc_lat, 90), -90);

    return {
      name: row.loc_name.trim(),
      geom: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      locatorId: row.loc_id,
      deleted: (row.loc_deleted !== 0),

      tags: (function () {
        var statuses = statusToTags(row.loc_status);
        var classes = classToTags(row.loc_class);

        return statuses.concat(classes);
      }()),

      content: [
        {
          type: 'created',
          user: row.creator,
          time: row.loc_created,
          data: {},
        },
        {
          type: 'story',
          user: row.creator,
          time: row.loc_created,
          data: {
            markdown: infoToMarkdown(row.loc_info),
          },
        },
      ],

      // Dummy values for clustering. Set here so that the keys exist.
      // Values do not need to mean anything.
      neighborsAvgDist: 1000,
      layer: 15,
    };
  };

  var post2story = function (row) {
    return {
      type: 'story',
      user: row.user_nick,
      time: row.posted,
      data: {
        markdown: infoToMarkdown(row.data),
      },
    };
  };

  console.log('Fetching locations...');

  var sql = 'SELECT locs.loc_id, locs.loc_name, ' +
            'locs.loc_lat, locs.loc_lon, ' +
            'locs.loc_created, users.user_nick AS creator, ' +
            'locs.loc_info, locs.loc_deleted, ' +
            'locs.loc_status, locs.loc_class FROM locs ' +
            'INNER JOIN users ' +
            'ON locs.loc_creator=users.user_id';

  db.query(sql, function (err, rows) {
    if (err) {
      return callback(err);
    }

    console.log(rows.length.toString(), 'locations fetched.');

    var locations = _.map(rows, loc2location);

    // Collect data from other tables for each location
    async.eachSeries(locations, function (loc, next) {

      console.log(loc.name);
      console.log('Fetching comments...');

      var sq2 = 'SELECT users.user_nick, posts.data, posts.posted ' +
                'FROM posts ' +
                'INNER JOIN users ' +
                'ON posts.user_id=users.user_id ' +
                'WHERE posts.thr_id=' + loc.locatorId;

      db.query(sq2, function (err2, rows2) {
        if (err2) {
          return next(err2);
        }

        var comments = rows2.map(post2story);

        Array.prototype.push.apply(loc.content, comments);

        console.log('Fetching classes...');

        var sq3 = 'SELECT class FROM subs WHERE loc=' + loc.locatorId;

        db.query(sq3, function (err4, rows3) {
          if (err4) {
            return next(err4);
          }

          rows3.forEach(function (row) {
            var c = classToTags(row.class);

            if (c.length > 0) {
              loc.tags.push(c[0]);
            }
          });


          console.log('Fetching visits...');

          var sq4 = 'SELECT users.user_nick ' +
                    'FROM visits INNER JOIN users ' +
                    'ON visits.vis_visitor=users.user_id ' +
                    'WHERE visits.vis_location=' + loc.locatorId;

          db.query(sq4, function (err5, rows5) {
            if (err5) {
              return next(err5);
            }

            var now = new Date();

            rows5.forEach(function (row) {
              loc.content.push({
                type: 'visit',
                user: row.user_nick,
                time: now.toISOString(),
                data: {
                  year: null,
                },
              });
            });

            console.log('Fetching references...');

            var sq5 = 'SELECT users.user_nick, refs.date, refs.url ' +
                      'FROM refs INNER JOIN users ' +
                      'ON refs.user=users.user_id ' +
                      'WHERE refs.enabled=1 AND refs.node=' + loc.locatorId;

            db.query(sq5, function (err6, rows6) {
              if (err6) {
                return next(err6);
              }

              rows6.forEach(function (row) {
                loc.content.push({
                  type: 'story',
                  user: row.user_nick,
                  time: row.date,
                  data: {
                    markdown: '[' + row.url + '](' + row.url + ')',
                  },
                });
              });

              console.log('Fetching attachments...');

              var sq6 = 'SELECT users.user_nick, files.fil_name,' +
                        'files.fil_key, files.fil_created ' +
                        'FROM files INNER JOIN users ' +
                        'ON files.fil_creator=users.user_id ' +
                        'WHERE files.fil_loc=' + loc.locatorId;

              db.query(sq6, function (err7, rows7) {
                if (err7) {
                  return next(err7);
                }

                rows7.forEach(function (row) {
                  loc.content.push({
                    type: 'attachment',
                    user: row.user_nick,
                    time: row.fil_created,
                    data: {
                      filename: row.fil_name,
                      key: row.fil_key,
                      mimetype: mime.lookup(row.fil_name),
                    },
                  });
                });

                console.log('Deduce visit times...');

                loc.content.forEach(function (c) {
                  var userEntries, oldest, creation;
                  if (c.type === 'visit') {
                    // Find oldest entry posted by the visitor.
                    userEntries = loc.content.filter(function (d) {
                      return (d.user === c.user);
                    });
                    // Sort to find the oldest
                    oldest = _.maxBy(userEntries, function (e) {
                      return e.time;
                    });
                    // Ignore the visit itself. Default to creation time.
                    if (oldest.type === 'visit') {
                      creation = _.find(loc.content, function (e) {
                        return (e.type === 'created');
                      });
                      c.time = creation.time;
                    } else {
                      c.time = oldest.time;
                    }
                  }
                });

                return next();
              });
            });
          });
        });
      });

    }, function then(err3) {
      if (err3) {
        return callback(err3);
      }

      return callback(null, {
        locations: locations,
      });
    });

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

    console.log(n + ' locations inserted successfully.');

    return callback();
  });
};
