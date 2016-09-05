import Backbone from 'backbone'

import template_page from '../templates/page/availability.hbs'

class ProjectPage extends Backbone.View {

  renderPage(target) {
    this.$el.html(template_page({ tracker_url: TRACKER_URL + '/embed' }))
    target.html(this.$el)
    this._resizeCrossDomainIframe('trackerIFrame', TRACKER_URL);
  }

  // Private methods

  _resizeCrossDomainIframe(id, other_domain) {
    const iframe = document.getElementById(id);
    if (window.addEventListener) {
      window.addEventListener('message', function (event) {
        if (event.origin !== other_domain) return;
        if (isNaN(event.data)) return;
        const height = parseInt(event.data);
        iframe.height = height + "px";
      }, false);
    } else if (window.attachEvent) {
      window.attachEvent('onmessage', function (event) {
        if (event.origin !== other_domain) return;
        if (isNaN(event.data)) return;
        const height = parseInt(event.data);
        iframe.height = height + "px";
      }, false);
    }
  }
}

export default ProjectPage