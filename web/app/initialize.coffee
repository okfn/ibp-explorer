application = require 'application'

$ ->
  answersFile = 'answers.csv';
  $('.requires-data').spin();

  miso_success = ->
    $('.requires-data').spin(false);
    application.initialize(this)
    Backbone.history.start()

  miso_error = (err)->
    $('.requires-data').spin(false);
    errBox = $('<div class="alert alert-error container"/>')
      .html('Error loading data: '+answersFile+'<br/>')
      .prependTo( $('section') );
    if (err) 
      errBox.append( $('<pre/>').text(JSON.stringify(err,null,2)) )

  # Fetch Questions, then Answers (you can do better with underscore)
  $.getJSON('questions.json', (questions)->
    ds = new Miso.Dataset({
      url : answersFile
      delimiter : ','
    })
    ds.fetch({
      success: miso_success
      error: miso_error
    })
    # Debug purposes
    window.ds = ds;
  )
