template_page = require 'views/templates/page/googlemap'

module.exports = class ProjectPage extends Backbone.View

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el

