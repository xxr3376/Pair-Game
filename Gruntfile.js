module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    less: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/static/less/',
          src: ['**/*.less', '!**/_*.less'],
          dest: '.tmp/css/',
          ext: '.css'
        }]
      }
    },
    autoprefixer: {
      dist: {
        options: {
          browsers: ['last 2 versions']
        },
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: ['**/*.css'],
          dest: 'app/static/css/',
          ext: '.css'
        }]
      }
    },
    watch: {
      css: {
        files: ['app/static/less/**/*'],
        tasks: ['css'],
      },
      js: {
        files: ['app/static/coffee/**/*'],
        tasks: [ 'coffee'],
      },
    },
    requirejs: {
    },
    coffee: {
      compile: {
        files: [
          {
          expand: true,
          cwd: 'app/static/coffee/',
          src: ['**/*.coffee'],
          dest: 'app/static/js',
          ext: '.js',
        }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.registerTask('css', [
    'less',
    'autoprefixer',
  ]);
  grunt.registerTask('server', [
    'css',
  ]);
  grunt.registerTask('dev', [
    'css',
    'coffee',
    'watch',
  ]);
  grunt.registerTask('deploy', [
    'requirejs',
    'css'
  ]);
};
