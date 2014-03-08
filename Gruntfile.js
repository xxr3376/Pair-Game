module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    connect: {
      options: {
        keepalive: true,
       },
      data: {
        options: {
          port: 9998,
          base: 'data'
        }
      }
    },
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
    },
    requirejs: {
      point: {
        options: {
          mainConfigFile: "rjs_config.js",
          out: "app/static/cjs/task-4point.js",
          name: "task-4point"
        }
      },
      attr: {
        options: {
          mainConfigFile: "rjs_config.js",
          out: "app/static/cjs/task-attr.js",
          name: "task-attr"
        }
      },
      orientation: {
        options: {
          mainConfigFile: "rjs_config.js",
          out: "app/static/cjs/task-orientation.js",
          name: "task-orientation"
        }
      },
      pose3d: {
        options: {
          mainConfigFile: "rjs_config.js",
          out: "app/static/cjs/task-pose3d.js",
          name: "task-pose3d"
        }
      },
      age_range: {
        options: {
          mainConfigFile: "rjs_config.js",
          out: "app/static/cjs/task-age-range.js",
          name: "task-age-range"
        }
      },
      landmark: {
        options: {
          mainConfigFile: "rjs_config.js",
          out: "app/static/cjs/task-landmark.js",
          name: "task-landmark"
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('css', [
    'less',
    'autoprefixer',
  ]);
  grunt.registerTask('server', [
    'css',
    'connect',
  ]);
  grunt.registerTask('deploy', [
    'requirejs',
    'css'
  ]);
};
