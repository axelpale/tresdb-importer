
var jsonfile = require('jsonfile');
var fsx = require('fs-extra');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

var createDirectoriesSync = function (filePath) {

  var p = path.dirname(filePath);
  var firstDir = mkdirp.sync(p);

  console.log(firstDir);
};

var getAbsoluteOldFilePath = function (fileEntry) {
  return path.resolve(__dirname, 'data', 'uploads', fileEntry.data.key);
};

var getRelativeFilePath = function (fileEntry) {
  var time = new Date(fileEntry.time);
  var key = fileEntry.data.key;
  var year = time.getFullYear().toString();

  return path.join(year, key, fileEntry.data.filename);
};

var getAbsoluteFilePath = function (fileEntry) {
  var relPath = getRelativeFilePath(fileEntry);
  return path.resolve(__dirname, 'data', 'tresdb-uploads', relPath);
}

var convertUploads = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  jsonfile.readFile('./data/dump.json', function (err, obj) {
    if (err) {
      return callback(err);
    }

    // TresDB location content entries of files.
    var fileEntries = [];

    // Collect all file entries
    obj.locations.forEach(function (loc) {

      // Do not collect files of deleted locations.
      if (loc.deleted) {

        return;

      }

      loc.content.forEach(function (item) {

        if (item.type === 'attachment') {

          fileEntries.push(item);
          return;

        }

      });

      return;

    });

    // For each file entry, create a directory and copy the file.
    fileEntries.forEach(function (entry) {

      // File path of an uploaded file, relative to
      // the directory for the uploads.
      var absPath = getAbsoluteFilePath(entry);

      createDirectoriesSync(absPath);

      // Copy file to the new directory
      var oldPath = getAbsoluteOldFilePath(entry);

      fsx.copySync(oldPath, absPath);

      console.log('Copied', oldPath);
      console.log('    to', absPath);
    });

    callback(null);
  });

};


// Execute

convertUploads(function (err) {
  if (err) {
    console.error(err);
  }
});
