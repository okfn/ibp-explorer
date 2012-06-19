
$.fn.budgetDataDump = function(ds) {
  var box = $('<pre style="max-height: 200px; overflow: scroll;"/>');
  this.append( box.html(JSON.stringify(ds)) );
  return this;
}

$.fn.budgetDataAnalysis = function(ds) {
  $.each(this,function() {
    var $this = $(this);
    var logBox = $('<pre/>').appendTo($this);
    function log(str) {
      logBox.append('&bull; '+str+'\n');
    }

    log("Dataset Ready. Columns: " + ds.columnNames());
    log("There are " + ds.length + " rows");
    log("Available Countries: " + ds.column("country").data);
  });
  return this;
}

$(function() {
  var dataFile = 'rawdata.csv';

  // On load...
  $('.requires-data').spin();

  function gotData() {
    $('.requires-data').spin(false);
    $('#data-dump').budgetDataDump(this);
    $('#data-analysis').budgetDataAnalysis(this);
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
  var ds = new Miso.Dataset({
    url : dataFile,
    delimiter : ','
  });
  ds.fetch({
    success: gotData,
    error: error
  });
});
