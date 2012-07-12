$(function() {
  var devicePixelRatio = window.devicePixelRatio || 1;
  function createCanvas(width, height) {
    var canvas = document.createElement("canvas")
    canvas.setAttribute("width", width * devicePixelRatio)
    canvas.setAttribute("height", height * devicePixelRatio)

    if (devicePixelRatio != 1) {
      var style = "width:" + width + "px;height:" + height + "px"
      canvas.setAttribute("style", style)
    }

    return canvas
  }
  $.fn.peity.add(
    'bar_multicolour',
    {
      colour: ['#f0f','#0f0'],
      delimeter: ",",
      height: 16,
      max: null,
      min: 0,
      width: 32
    },
    function(opts) {
      var $this = $(this)
      var values = $this.text().split(opts.delimeter)
      var max = Math.max.apply(Math, values.concat([opts.max]));
      var min = Math.min.apply(Math, values.concat([opts.min]))

      var canvas = createCanvas(opts.width, opts.height)
      var context = canvas.getContext("2d");

      var width = canvas.width
      var height = canvas.height
      var yQuotient = height / (max - min)
      var space = devicePixelRatio / 2
      var xQuotient = (width + space) / values.length


      for (var i = 0; i < values.length; i++) {
        var x = i * xQuotient
        var y = height - (yQuotient * (values[i] - min))

        var xx = Math.round(x)+0.5;
        var yy = Math.round(y)+0.5;
        var ww = Math.round(xQuotient - space);
        var hh = Math.round(yQuotient * values[i])-1;
        if (i==values.length-1) {
          // 1px adjust
          ww--;
        }

        context.fillStyle = opts.colour[i % opts.colour.length];
        context.fillRect(xx,yy,ww,hh);
        context.strokeStyle = '#000';
        context.strokeRect(xx,yy,ww,hh);
      }

      $this.wrapInner($("<span>").hide()).append(canvas)
    }
  );
});

