/*global module:false*/
module.exports = function(grunt) {"use strict";

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    meta : {
      banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    config_files: ['Gruntfile.js','package.json','component.json','config/karma*.conf.js'],
    app_files: ['src/app/**/*.js'],
    test_files: ['src/test/**/*.js'],
    source_files: ['<%= config_files %>','<%= app_files %>','<%= test_files %>'],
    watch : {
      scripts: {
        files: ['<%= source_files %>'],
        tasks: ['default']
      }
    },
    jshint : {
      files : ['<%= app_files %>', '<%= test_files %>'],
      options : {
        curly : true,
        eqeqeq : true,
        forin : true,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        sub : true,
        undef : true,
        unused : true,
        strict : true,
        boss : true,
        eqnull : true,
        browser : true,
        jquery : true,
        devel : true,
        globals : {
          //jasmine
          describe : false,
          ddescribe : false,
          beforeEach : false,
          it : false,
          iit : false,
          expect : false,
          //karma
          dump: false,
          //angular
          angular : false
        }
      },
    },
    karma : {
      unit : {
        options : {
          configFile : 'config/karma.unit.conf.js',
          keepalive : true,
          autoWatch : false,
          singleRun : true,
          port: 20000,
          runnerPort: 20001
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma']);
};
