application = require 'application'
CountryView = require 'views/country_view'
CompareView = require 'views/compare_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'home'
    'country/:id': 'countryview'
    'compare/*path' : 'compare'

  home: ->
    $('#content').html application.homeView.render().el

  countryview: (country) ->
    $('#content').html new CountryView(country).render().el

  compare: (path) ->
    # Split by / and remove empty strings
    path = path.split('/')
    path = _.filter path, _.identity

    view = new CompareView(path)
    $('#content').html view.render().el
    view.post_render()
