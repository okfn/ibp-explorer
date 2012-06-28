# The application bootstrapper.
Application =
  initialize: (@data) ->
    HomeView = require 'views/home_view'
    Router = require 'router'
    sidebar = require 'views/sidebar_view'

    # Ideally, initialized classes should be kept in controllers & mediator.
    # If you're making big webapp, here's more sophisticated skeleton
    # https://github.com/paulmillr/brunch-with-chaplin
    @homeView = new HomeView()

    # Render static parts of the page
    $('nav').html(sidebar.render().el)

    # Instantiate the router
    @router = new Router()
    # Freeze the object
    Object.freeze? this

module.exports = Application
