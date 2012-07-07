var IBP = {
  budgetDataDump: function(el,ds) {
    var box = $('<pre style="max-height: 200px; overflow: scroll;"/>');
    el.append( box.html(JSON.stringify(ds)) );
  },

  budgetDataAnalysis: function(el,ds) {
    var columnNames = ds.columnNames();
    var well = $('<div class="well clearfix"/>').appendTo(el);
    var questionBox = $('<div id="questionBox"/>').appendTo(well);
    var answerBox = $('<div id="answerBox"/>').appendTo(well);

    var budgetView = $('<table class="budget-view"/>').appendTo( $('<div class="budget-view-outer"/>').appendTo(el) );
    $('<br/>').appendTo(el);
    var logBox = $('<pre/>').appendTo(el);

    // TODO use Handlebars for all this, really
    var budgetHead = $('<tr/>').appendTo( $('<thead/>').appendTo(budgetView) );
    budgetHead.append( $('<th class="country"/>').text('country') );
    for (var i=1;i<columnNames.length;i++) {
      budgetHead.append( $('<th data-x="'+i+'" class="score" />').text(i) );
    }

    function hoverCell(e) {
      var t = $(e.target);
      var x = t.attr('data-x');
      var y = t.attr('data-y');
      var a = t.text();

      $('.budget-view th').removeClass('active');
      $('.budget-view th[data-x='+x+']').addClass('active');
      $('.budget-view .country').removeClass('active');
      var countryBox = $('.budget-view .country[data-y='+y+']');
      countryBox.addClass('active');

      questionBox.text( 'Question '+x+': '+IBP.questions[x-1].question );
      answerBox.html( '<h3>'+countryBox.text()+'</h3>' + a.toUpperCase()+': '+IBP.questions[x-1][a] );
    }

    ds.each(function(row,index) {
      var tr = $('<tr/>').appendTo(budgetView);
      tr.append( $('<td data-y="'+index+'" class="country" />').html(row.country) );
      for (var i=1; i<columnNames.length; i++) {
        var v = row[columnNames[i]];
        var td = $('<td data-x="'+i+'" data-y="'+index+'" class="score '+v+'"/>').html(v);
        td.mouseover(hoverCell);
        tr.append( td );
      }
    });

    function log(str) {
      logBox.append('&bull; '+str+'\n');
    }

    log("Dataset Ready. Columns: " + ds.columnNames());
    log("There are " + ds.length + " rows");
    log("Available Countries: " + ds.column("country").data);
  }
};

$(function() {
  var dataFile = 'answers.csv';

  // On load...
  $('.requires-data').spin();

  function gotData() {
    $('.requires-data').spin(false);
    IBP.budgetDataDump( $('#data-dump'), this );
    IBP.budgetDataAnalysis( $('#data-analysis'), this );
  }
  function error(err) {
    $('.requires-data').spin(false);
    var errBox = $('<div class="alert alert-error container"/>')
      .html('Error loading data: '+dataFile+'<br/>')
      .prependTo( $('section') );
    if (err) {
      errBox.append( $('<pre/>').text(JSON.stringify(err,null,2)) )
    }
  }
  // Fetch Questions, then Answers (you can do better with underscore)
  $.getJSON('questions.json', function(data) {
    IBP.questions = data;
    var ds = new Miso.Dataset({
      url : dataFile,
      delimiter : ','
    });
    ds.fetch({
      success: gotData,
      error: error
    });
    // Debug purposes
    window.ds = ds;
  });
});
