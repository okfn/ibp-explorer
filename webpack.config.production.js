'use strict'

var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack')

let extractCSS = new ExtractTextPlugin('[name].css');
let extractLESS = new ExtractTextPlugin('[name].css');

module.exports = {
  entry: {
    app: './app/initialize.js'
    , vendor: ['jquery', 'underscore', 'backbone', 'chosen', 'downloadify'
      , 'bootstrap-js', 'jsPlumb', 'exports?jvm!jvm', 'jvm-world-mill'
      , 'jvm-css', 'jsPlumb', 'ibpDataset', 'searchDataset', 'console-helper'
      , 'jquery.color', 'vendor-css', 'monkeypatches', 'handlebars']
  }
  , resolve: {
    root: __dirname
    , modulesDirectories: ['vendor', 'node_modules']
    , alias: {
      jvm: 'jvectormap-dev/jquery-jvectormap.dev.js'
      , 'jvm-world-mill': 'jvectormap-dev/jquery-jvectormap-world-mill-en.js'
      , 'jvm-css': 'jvectormap-dev/jquery-jvectormap-1.0.css'
      , jsPlumb: 'jquery.jsPlumb-1.3.9-all.js'
      , ibpDataset: 'ibp_dataset.js'
      , searchDataset: 'search_dataset.js'
      , chosen: 'chosen.jquery.min.js'
      , 'console-helper': 'scripts/console-helper.js'
      , 'jquery.color': 'scripts/jquery.color-2.1.2.js' // npm contains 1.5.1
      , 'vendor-css': 'styles/main.css'
      , 'bootstrap-js': 'scripts/bootstrap.min.js'
      , monkeypatches: 'scripts/monkeypatches.js'
      , downloadify: 'scripts/Downloadify/downloadify.min.js'
      , 'handlebars': 'handlebars/runtime.js'
    }
  }
  , output: {
    filename: 'javascripts/app.js'
    , path: __dirname + '/_build'
  }
  , module: {
    loaders: [
      {
        test: /\.js$/
        , loader: 'babel-loader'
        , include: path.resolve(__dirname, 'app')
        , exclude: [path.resolve(__dirname, 'node_modules')
        , path.resolve(__dirname, 'vendor')]
        , query: { presets: ['es2015'] }
      }
      , {
        test: /\.(png$|jpg$|woff2$)/
        , loader: 'file?name=[path][name].[ext]'
      }
      , {
        test: /\.hbs$/
        , include: path.resolve(__dirname, 'app')
        , loader: 'handlebars-loader'
      }
      , {
        test: /\.html$/
        , loader: 'file?name=[name].[ext]'
      }
      , {
        test: /\.less$/
        , loader: extractLESS.extract('style-loader'
          , 'css-loader!less-loader')
      }
      , {
        test: /\.css$/,
        loader: extractCSS.extract("style-loader", "css-loader")
      }
      , {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      }
      , {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream"
      }
      , { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" }
      , {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/
        , loader: "url?limit=10000&mimetype=image/svg+xml"
      }
    ]
  }
  , node: {
    fs: 'empty' // avoids error messages
  }
  , plugins: [
    extractCSS
    , extractLESS
    , new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
      , filename: 'javascripts/vendor.js'
      , minChunks: Infinity
    })
    , new webpack.ProvidePlugin({
      jQuery: 'jquery'
      , $: 'jquery'
      , 'window.jQuery': 'jquery'
      , 'Handlebars': 'handlebars'
    })
    , new CopyWebpackPlugin([
      { from: './app/assets/images', to: 'images' }
      , { from: './app/assets/downloads', to: 'downloads' }
      , { from: './app/assets/downloadify.swf', to: './' }
    ])
    , new webpack.optimize.OccurenceOrderPlugin()
    , new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: false
        , warnings: false
      }
    })
  ]
}
