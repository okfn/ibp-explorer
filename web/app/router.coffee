application = require 'application'
CountryView = require 'views/country_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'home'
    'country/:id': 'countryview'

  home: ->
    $('body').html application.homeView.render().el

  countryview: (id) ->
    $('body').html new CountryView(id).render().el

