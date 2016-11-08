import Backbone from 'backbone'


import template_page from '../templates/page/availability.hbs'

class ProjectPage extends Backbone.View {

  renderPage(target) {
    fetch('/tracker_url').then((res) => {
      return res.json()
    }).then((body) => {
      const TRACKER_URL = body.message
      target.html(template_page({ tracker_url: TRACKER_URL + '/embed' }))
      this._resizeCrossDomainIframe('trackerIFrame', TRACKER_URL);
      console.log($('#explorer').children().length)
    })
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
