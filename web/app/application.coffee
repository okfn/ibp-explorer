# The application bootstrapper.
Application =
  initialize: (rawdata) ->
    HomeView = require 'views/home_view'
    Router = require 'router'

    @questions = rawdata.questions

    @answers = new Miso.Dataset({
      data: rawdata.answers
    })
    @answers.fetch()

    # Static view components
    @homeView = new HomeView()

    # Instantiate the router
    @router = new Router()
    # Freeze the object
    Object.freeze? this

module.exports = Application
