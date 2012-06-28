application = require 'application'

$ ->
  answersFile = 'answers.csv';
  $('.requires-data').spin();

  miso_success = (questions,dataset)->
    $('.requires-data').spin(false);
    application.initialize(questions,dataset)
    Backbone.history.start()

  miso_error = (err)->
    $('.requires-data').spin(false);
    errBox = $('<div class="alert alert-error container"/>')
      .html('Error loading data: '+answersFile+'<br/>')
      .prependTo( $('section') );
    if (err) 
      errBox.append( $('<pre/>').text(JSON.stringify(err,null,2)) )

  # TODO roll all data into a single JSON and then boot Miso datasets from them
  $.getJSON('questions.json', (questions)->
    ds = new Miso.Dataset({
      url : answersFile
      delimiter : ','
    })
    ds.fetch({
      success: -> miso_success(questions,ds)
      error: miso_error
    })
  )
