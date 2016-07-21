'use strict'

var webpack = require('webpack')
var baseConfig = require('./webpack.config.base')

var productionConfig = {
  debug: false
  , output: {
    filename: 'app.js'
    , path: './dist_webconfig'
  }
  , plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
    , new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true
        , warnings: false
      }
    })
  ]
}

var config = Object.assign({}, baseConfig, productionConfig)
module.exports = config
