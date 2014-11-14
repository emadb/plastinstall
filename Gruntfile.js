var grunt = require('grunt');

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-nodemon');

    grunt.initConfig({
      nodemon: {
        dev: {
          script: 'index.js',
          options: {
            args: [],
            nodeArgs: ['--debug'],
            callback: function(nodemon) {
                nodemon.on('log', function(event) {
                    console.log(event.colour);
                });
            },
            env: {
                PORT: '3000'
            },
          }
        }
      }
    });

    grunt.registerTask('default', ['nodemon']);
};
