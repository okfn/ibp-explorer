'use strict'

var webpack = require('webpack')
var baseConfig = require('./webpack.config.base')

var developmentConfig = {
  debug: true
  , devtool: 'source-map'
}

var config = Object.assign({}, baseConfig, developmentConfig)
module.exports = config