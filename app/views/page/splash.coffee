template_page = require 'views/templates/page/splash'

module.exports = class SplashPage extends Backbone.View

    ##################
    ## Public methods
    ##################
    initialize: =>

    renderPage: (target) =>
        # Write to DOM
        @$el.html template_page()
        target.html @$el
        # Bind to on-page elements
        # ... nothing to bind on this page

