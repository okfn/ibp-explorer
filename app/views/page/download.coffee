template_page = require 'views/templates/page/download'

module.exports = class DownloadPage extends Backbone.View
    renderPage: (target) =>
        @$el.html template_page _EXPLORER_DATASET
        target.html @$el
