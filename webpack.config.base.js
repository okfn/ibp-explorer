'use strict'
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require("webpack")

module.exports = {
  entry: path.join(__dirname, '/app/initialize.js')
  , output: {
    filename: 'javascripts/app.js'
    , path: './dist'
  }
  , devtool: 'source-map'
  , module: {
    loaders: [
      {
        test: /\.js$/
        , loader: 'babel-loader'
        , exclude: ['/node_modules/', '/vendor/']
        , query: { presets: ['es2015'] }
      }
      , {
        test: /\.(png$|jpg$|svg$|ttf$|woff$|woff2$|eot$)/
        , loader: 'file?name=[path][name].[ext]'
      }
      , {
        test: /\.hbs$/
        , loader: 'handlebars-loader'
      }
      , {
        test: /\.html$/
        , loader: 'file?name=[path][name].[ext]'
      }
      , { test: /\.less$/
        , loader: ExtractTextPlugin.extract('style-loader'
                                            , 'css-loader!less-loader')
      }
    ]
  }
  , debug: true
  , node: {
    fs: "empty" // avoids error messages
  }
  , plugins: [
    new ExtractTextPlugin(
      'app.css'
      , { allChunks: false }
    ),
    new CopyWebpackPlugin([
      { from: './app/assets' }
    ])
  ]
}
