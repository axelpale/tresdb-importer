
// Locator info fields contain html entities.
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

module.exports = function (info) {
  // Convert Xitrux Locator info to UTF-8 markdown.

  if (info === null) {
    info = '';
  }

  if (typeof info !== 'string') {
    throw new Error('Info is required to be a string. ' +
                    'Now it is: ' + (typeof info));
  }

  // Convert html entities to UTF-8 characters
  info = entities.decode(info);

  // Remove carriage return \r
  info = info.replace(/[\r]+/g, '');

  // Remove unnecessary escape characters
  info = info.replace(/\\"/g, '"');

  // Some infos contain trailing whitespace.
  info = info.trim();

  return info;
};
