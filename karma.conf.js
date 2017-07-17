// Karma configuration
// Generated on Fri Jul 14 2017 14:40:42 GMT+0300 (Belarus Standard Time)

var path = require('path');
var webpack = require('webpack');
var JasmineWebpackPlugin = require('jasmine-webpack-plugin');
module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'js/*/*.js',
      'tests/*/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],

    plugins: [
      "karma-jasmine-jquery",
      "karma-jasmine",
      "jasmine-core",
      "karma-webpack",
      "karma-babel-preprocessor",
      "karma-sourcemap-loader",
      "karma-chrome-launcher"
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'js/**/*.js': ['webpack', 'babel', 'sourcemap'],
      'tests/**/*.js': ['webpack', 'babel', 'sourcemap'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    webpack: {
      entry: {
        app: "./app.js",
        auth: "./js/auth/authView",
        pictures: "./js/pictures/picturesView",
        vendor: [
          "./node_modules/jquery/dist/jquery.min",
          "./node_modules/jquery-bridget/jquery-bridget",
          "./node_modules/underscore/underscore-min",
          "./node_modules/backbone/backbone-min",
          "./libs/jszip",
          "./libs/jszip-utils",
          "./libs/masonry",
          "./libs/sha1",
          "./libs/js.cookie",
          "./libs/filesaver"
        ],
      },
      output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
      },
      resolve: {
        alias: {
          Libs: path.resolve(__dirname, './libs'),
          Auth: path.resolve(__dirname, './js/auth'),
          Pictures: path.resolve(__dirname, './js/pictures'),
          Shared: path.resolve(__dirname, './js/shared'),
          Jquery: path.resolve(__dirname, './node_modules/jquery/dist/jquery.min'),
          Bridget: path.resolve(__dirname, './node_modules/jquery-bridget/jquery-bridget'),
          Underscore: path.resolve(__dirname, './node_modules/underscore/underscore-min'),
          Backbone: path.resolve(__dirname, './node_modules/backbone/backbone-min')
        }
      },
      module: {
        loaders: [
          {
            test: /\.html$/,
            loader: 'raw-loader',
          },
          {
            test: /\.json$/,
            loader: 'json-loader'
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: [['es2015', { module: false }]]
            }
          }
        ]
      }
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
