var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable'),
    util = require('util'),
    os = require('os');

var AdmZip = require('adm-zip');
var exec = require('child_process').exec;

process.env.TMPDIR = '/temp';

var saveTo;
var workingFolder = './unzipped';

http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.write(util.inspect({fields: fields, files: files}));
    });

    form.on('end', function() {
      var tempPath = this.openedFiles[0].path;
      var fileName = this.openedFiles[0].name;
      fs.rename(tempPath, fileName);

      var zip = new AdmZip(fileName);
      zip.extractAllTo(workingFolder, true);

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
            res.write(error.toString());
            res.write(stderr.toString());
            res.end();
            console.log("ERROR",error )
            return;
          }
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.write('completed');
          res.end(stdout.toString());
        });
      });


      res.end('end');
    });

    return;
    

  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end('<html><head></head><body><form method="POST" enctype="multipart/form-data"><input type="file" name="package"><br /><input type="submit"></form></body></html>');
  }
  res.writeHead(404);
  res.end();
}).listen(9003, function() {
  console.log('Listening for requests on port 9003');
});