application = require 'application'
CountryView = require 'views/country_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'home'
    'country/:id': 'countryview'

  home: ->
    $('#content').html application.homeView.render().el

  countryview: (id) ->
    $('#content').html new CountryView(id).render().el

