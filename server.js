'use strict'

require('babel-core/register');
var express = require('express')

var PORT = process.env.PORT || 8080

function start() {
  let app = express()
  app.use('/', express.static('./_build'))
  app.get('/tracker_url', (req, res) => {
    res.json({message: process.env.TRACKER_URL })
  })
  app.listen(PORT, function () {
    console.log('Server started at port ' + PORT)
  })
}

start()