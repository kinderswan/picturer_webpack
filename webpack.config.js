var path = require('path');
var webpack = require('webpack');

module.exports = {
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
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      { name: 'vendor', filename: 'vendor.js' }
    )
  ],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  },
  devtool: "source-map",
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
          presets: ['es2015']
        }
      }
    ]
  }
}