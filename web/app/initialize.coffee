application = require 'application'

$ ->
  $('.requires-data').spin();

  $.getJSON('data.json', (data)->
    $('.requires-data').spin(false);
    application.initialize(data)
    Backbone.history.start()
  )

