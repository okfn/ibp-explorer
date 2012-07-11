application = require 'application'
CountryView = require 'views/country_view'
ProfileView = require 'views/profile_view'
CompareView = require 'views/compare_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'home'
    'country': 'countryview'
    'country/:id': 'countryview'
    'compare' : 'compare'
    'compare/*path' : 'compare'
    'profile' : 'profile'
    'profile/*path' : 'profile'

  initialize: ->
    @on('all', @postRender)

  postRender: (trigger) ->
    # Trigger nav updates
    trigger = trigger.split(':')
    if trigger[0]=='route'
      $('nav li').removeClass 'active'
      $('nav li[action='+trigger[1]+']').addClass 'active'
    # Fill out content
    if @active
      $('#content').html @active.render().el
    else
      $('#content').html ''
    # Trigger post_render hook
    if @active and @active.post_render
      @active.post_render()

  home: ->
    @active = application.homeView

  countryview: (country='') ->
    @active = new CountryView(country)

  profile: (country='') ->
    @active = new ProfileView(country)

compare: (path='') ->
    # Split by / and remove empty strings
    path = path.split('/')
    path = _.filter path, _.identity
    @active = new CompareView(path)
