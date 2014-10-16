var exec = require('child_process').exec;
var cmd = "copy .\\migrator\\Velocar.VSP.DatabaseMigrator.exe ..";
var workingFolder = ".\\unzipped\\";

var res = exec(cmd, {cwd: workingFolder}, function callback(error, stdout, stderr){
    console.log('ok');
    console.log(error);
    console.log(stdout);
    console.log(stderr);
});

