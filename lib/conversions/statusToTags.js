// Location status to a TresDB tag

module.exports = function (s) {

  if (typeof s !== 'number') {
    throw new Error('a number is required');
  }

  if (s === 0) {
    // If the status is unknown, do not add tag.
    return [];
  }

  // Tag slugs   // Original state names
  var states = [
    'Unknown',        // Unknown
    'walk-in',        // Abandoned
    'guarded',        // Active
    'locked',         // Closed
    'demolished',     // Demolished
    'walk-in',        // Natural
  ];

  if (s >= states.length) {
    throw new Error('status number too high: ' + s);
  }

  return [states[s]];
};
