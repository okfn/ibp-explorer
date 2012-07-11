application = require 'application'
ProfileView = require 'views/profile_view'
CompareView = require 'views/compare_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'home'
    'compare' : 'compare'
    'compare/*path' : 'compare'
    'profile/table' : 'profile_table'
    'profile/table/*path' : 'profile_table'

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

  profile_table: (country='') ->
    @active = new ProfileView(country)

compare: (path='') ->
    # Split by / and remove empty strings
    path = path.split('/')
    path = _.filter path, _.identity
    @active = new CompareView(path)
