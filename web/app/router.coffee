application = require 'application'
CountryView = require 'views/country_view'
CompareView = require 'views/compare_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'home'
    'country': 'countryview'
    'country/:id': 'countryview'
    'compare' : 'compare'
    'compare/*path' : 'compare'

  initialize: ->
    @on('all', @updateNav)

  updateNav: (trigger) ->
    # Trigger nav updates
    trigger = trigger.split(':')
    if trigger[0]=='route'
      $('nav li').removeClass 'active'
      $('nav li[action='+trigger[1]+']').addClass 'active'
    # Fill out content
    $('#content').html @active.render().el
    # Fill out sidebar
    if @active and @active.sidebar
      $('#sidebar').html @active.sidebar()
    else
      $('#sidebar').html ''
    # Trigger post_render hook
    if @active and @active.post_render
      @active.post_render()

  home: ->
    @active = application.homeView

  countryview: (country='') ->
    @active = new CountryView(country)

  compare: (path='') ->
    # Split by / and remove empty strings
    path = path.split('/')
    path = _.filter path, _.identity
    @active = new CompareView(path)
