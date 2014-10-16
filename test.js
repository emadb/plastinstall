var async = require('async');

var things = [1,2,3,4,5,6,7];

async.eachSeries(things, function(item, callback){
    console.log(item);
    callback();
});