// Location class to a TresDB tag.

module.exports = function (c) {

  if (typeof c !== 'number') {
    throw new Error('a number is required');
  }

  if (c === 0 || c === 10) {
    // If the status is unknown, do not add tag.
    return [];
  }

  // Tag slug  // Rural

  var classes = [
    'Unknown',
    'aviation',       // Aviation
    'shop',           // Business
    'hospital',       // Departments
    'heavy-industry', // Industry
    'leisure',        // Leisure
    'marine',         // Marine
    'military',       // Military
    'mining',         // Mining
    'infrastructure', // Municipal
    '',               // Other
    'railway',        // Railway
    'residental',     // Residental
    'agricultural',   // Rural
    'vehicle',        // Transport
    'underground',    // Underground
  ];

  if (c >= classes.length) {
    throw new Error('class number too high: ' + c);
  }

  return [classes[c]];
};
