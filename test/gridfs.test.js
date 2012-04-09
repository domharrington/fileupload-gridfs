var database = 'gridfs-test'
  , gridfs = require('../index')({
      database: database
    })
  , should = require('should')
  , fileName = 'test.gif'
  , filePath = require('path').join(__dirname, 'files', fileName)
  , put = gridfs.put
  , get = gridfs.get
  , remove = gridfs.delete
  ;

describe('fileupload-gridfs', function() {

  describe('#put()', function() {

    it('successfully puts a file when given a file path', function(done) {
      put(filePath, function(error, file) {
        get(fileName, function(error, data) {
          Buffer.isBuffer(data).should.equal(true);
          done();
        });
      });
    });

    it('returns the correct file mime type', function(done) {
      put(filePath, function(error, file) {
        file.type.should.equal(require('mime').lookup(filePath));
        done();
      });
    });

    it('returns the correct file size', function(done) {
      put(filePath, function(error, file) {
        require('fs').stat(filePath, function(error, stats) {
          file.size.should.equal(stats.size);
          done();
        });
      });
    });

    it('returns an error if file doesnt exist', function(done) {
      put('test-fake-file.gif', function(error, file) {
        should.exist(error);
        should.not.exist(file);
        error.should.be.an.instanceof(Error);
        error.code.should.equal('ENOENT');
        done();
      });
    });

  });

  describe('#get()', function() {

    it('returns the file when passed a file name', function(done) {
      put(filePath, function(error, file) {
        get(file.name, function(error, file) {
          file.should.be.an.instanceof(Buffer);
          done();
        });
      });
    });

    it('returns an error if file doesnt exist', function(done) {
      get('test-fake-file.gif', function(error, file) {
        should.exist(error);
        should.not.exist(file);
        error.should.be.an.instanceof(Error);
        error.message.should.equal('The file you wish to read does not exist.');
        done();
      });
    });

  });

  describe('#delete()', function() {

    it('deletes the file when given a file path', function(done) {
      put(filePath, function(error, file) {
        file = file.name;
        remove(file, function(error) {
          get(file, function(error, file) {
            should.exist(error);
            should.not.exist(file);
            error.should.be.an.instanceof(Error);
            error.message.should.equal('The file you wish to read does not exist.');
            done();
          });
        });
      });
    });

  });

  afterEach(function(done) {
    remove(fileName, function() {
      done();
    });
  });

  after(function(done) {
    require('child_process').exec(
      'echo \'db.dropDatabase();\' | mongo ' + database, function() {

      done();
    });
  });
});