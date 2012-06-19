
$.fn.budgetDataDump = function(data) {
  var box = $('<pre style="max-height: 200px; overflow: scroll;"/>');
  this.append( box.html(JSON.stringify(data)) );
  return this;
}

$.fn.budgetDataAnalysis = function(data) {
  $.each(this,function() {
    var $this = $(this);
    var ds = new Miso.Dataset({
      data : data
    });
    var logBox = $('<pre/>').appendTo($this);
    function log(str) {
      logBox.append('&bull; '+str+'\n');
    }

    ds.fetch({ 
      success : function() {
        log("Dataset Ready. Columns: " + this.columnNames());
        log("There are " + this.length + " rows");
        log("Available Colors: " + this.column("color").data);
      }
    });
  });
  return this;
}

$(function() {
  var dataFile = 'rawdata.json';
  //var dataFile = 'testdata.json';

  // On load...
  $('.requires-data').spin();

  function gotData(data) {
    $('.requires-data').spin(false);
    $('#data-dump').budgetDataDump(data);
    $('#data-analysis').budgetDataAnalysis(data);

  }
  function error(err) {
    $('.requires-data').spin(false);
    $('<div class="alert alert-error container"/>')
      .html('Error loading data: '+dataFile+'<br/>')
      .append( $('<pre/>').text(JSON.stringify(err,null,2)) )
      .prependTo( $('section') );
  }
  $.ajax({
    url: dataFile,
    success: gotData,
    error: error,
    dataType: 'json'
  });
});
