/* eslint-disable global-require */

var vs = [1, 2, 3];

vs.forEach(function (v) {
  var mod = 'v' + v;

  module.exports[mod] = require('./' + mod);
});
