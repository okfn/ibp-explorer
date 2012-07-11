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

    @countries = (@get_country(row) for row in rawdata.answers )

    # Static view components
    @homeView = new HomeView()

    # Instantiate the router
    @router = new Router()
    # Freeze the object
    Object.freeze? this
    window.t = rawdata.answers[0]

  get_country: (row) ->
    values = _.values(row)
    count = (countMe) -> (a,e) -> a+(e==countMe)
    name: row.country
    count_a: _.reduce(values, count('a'), 0 )
    count_b: _.reduce(values, count('b'), 0 )
    count_c: _.reduce(values, count('c'), 0 )
    count_d: _.reduce(values, count('d'), 0 )
    count_e: _.reduce(values, count('e'), 0 )

module.exports = Application
