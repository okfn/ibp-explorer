!function ($) {

  var timeout;
  var docs;

  function GetText (text) {
    return text;
  }

  function Popovers () {
    $('[data-toggle="popover"]').popover({
      container: 'body',
      trigger: 'hover'
    });
  }

  $(function () {
    $('#overview-table').fixedHeader({
      topOffset: 40
    });
    $('#heading').scrollToFixed({
      marginLeft: 1,
      preFixed: function () {
        var width = $(this).parent().outerWidth() - 2;
        $(this).css('width', width+30);
      }
    });

    $('#more-links p').each(function () {
      var html = $(this).html();
      if (html.indexOf('<!-- more -->') > 0) {
        var bits = html.split('<!-- more -->');
        var new_html = bits[0]+' <span class="more-link">... <a href="#">more</a></span><span class="more">'+bits[1]+'</span>';
        $(this).addClass('has-more-link').html(new_html);
        $('.more-link a', this).on('click', function (event) {
          event.preventDefault();
          $(this).parents('p').addClass('more-expanded');
        });
      }
    });

    Popovers();
    $(window).on('scroll', function () {
      clearTimeout(timeout);
      timeout = setTimeout(Popovers, 500);
    });

  });
}(window.jQuery);
