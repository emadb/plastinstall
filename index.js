var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    os = require('os');

var AdmZip = require('adm-zip');
var exec = require('child_process').exec;
var Busboy = require('busboy');
var saveTo;
var workingFolder = './unzipped';

http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var busboy = new Busboy({ headers: req.headers });
    
//    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//      saveTo = path.join(__dirname, path.basename(filename));
//      file.pipe(fs.createWriteStream(saveTo));
//    });
    
    busboy.on('finish', function() {
      //var zip = new AdmZip(saveTo);
      //zip.extractAllTo(workingFolder, true);

      var spec = require(workingFolder + '/spec.json');
        
      if (spec.commands.length === 0){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('nothing to do');
      }
          
      spec.commands.forEach(function(cmd){
         exec(cmd, {cwd: workingFolder}, function callback(error, stdout, stderr){
          if (error){
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.write('ERRORS');
            res.write(error);
            res.write(stderr);
            res.end();
            return;
          }
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.write('completed');
          res.end(stdout);
        });
      });
        
    });
    return req.pipe(busboy);

  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end('<html><head></head><body><form method="POST" enctype="multipart/form-data"><input type="file" name="package"><br /><input type="submit"></form></body></html>');
  }
  res.writeHead(404);
  res.end();
}).listen(9003, function() {
  console.log('Listening for requests on port 9003');
});