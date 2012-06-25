application = require 'application'
data = require 'data'

$ ->
  # Pull data from the server
  $.getJSON('data.json', (ajaxData)->
    _.extend data, ajaxData
    application.initialize()
    Backbone.history.start()
  )

