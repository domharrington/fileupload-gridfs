var GridFS = require('GridFS')
  , fs = require('fs')
  ;

module.exports = function(options) {
  options.database = options.database || 'gridfs';

  var gridFs = new GridFS.GridFS(options.database);

  function put(file, callback) {
    fs.stat(file, function(error, stats) {
      if (error && error.code === 'ENOENT') {
        return callback(error);
      }

      var readFile = fs.createReadStream(file)
        , fileName = require('path').basename(readFile.path)
        , writeFile = GridFS.GridStream.createGridWriteStream(options.database, fileName, 'w')
        ;

      readFile.pipe(writeFile);

      writeFile.on('close', function() {
        callback(null, {
          size: stats.size,
          name: fileName,
          type: require('mime').lookup(file)
        });
      });
    });
  }

  function get(file, callback) {
    gridFs.get(file, callback);
  }

  function remove(file, callback) {
    gridFs.delete(file, callback);
  }

  return {
    put: put,
    get: get,
    delete: remove
  };
};