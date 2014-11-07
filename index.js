var http = require('http'),
    fs = require('fs'),
    formidable = require('formidable'),
    util = require('util'),
    async = require('async'),
    AdmZip = require('adm-zip'),
    exec = require('child_process').exec;


process.env.TMPDIR ||= '/vsp/temp';
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
      fs.renameSync(tempPath, fileName);

      var zip = new AdmZip(fileName);
      zip.extractAllTo(workingFolder, true);

      var spec = require(workingFolder + '/spec.json');
        
      if (spec.commands.length === 0){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('nothing to do');
      }
        
      res.writeHead(200, {'Content-Type': 'text/plain'});
          
      var cmds = spec.commands.map(function(cmd){
        return function(acallback){
          exec(cmd, {cwd: workingFolder}, function callback(error, stdout, stderr){
          if (error){
            res.write('ERRORS');
            res.write(error.toString());
            res.write(stderr.toString());
            res.end();
            acallback();
            return;
          }
          res.write(stdout||'.');
          acallback();
          });
       }
      });

      async.series(cmds, function(){
        res.end('\nCompleted');
      });

    });

    return;
    

  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end('<html><head></head><body><form method="POST" enctype="multipart/form-data"><input type="file" name="package"><br /><input type="submit"></form></body></html>');
  }
  res.writeHead(404);
  res.end();
}).listen(process.env.PORT, function() {
  console.log('Listening...');
});