application = require 'application'
ProfileView = require 'views/profile_view'
CompareView = require 'views/compare_view'
RankingsView = require 'views/rankings_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'profile_table__default'
    'compare/category/:category/*path' : 'compare'
    'compare/*path' : 'compare__all'
    'profile/table/*country' : 'profile_table'
    'profile/grid/*country' : 'profile_grid'
    'rankings/' : 'rankings'
    'rankings/category-:category/' : 'rankings'
    'rankings/region-:region/' : 'rankings__all_categories'
    'rankings/category-:category/region-:region/' : 'rankings'

  initialize: ->
    @on('all', @postRender)

  postRender: (trigger) ->
    # Trigger nav updates
    trigger = trigger.split(':')
    if trigger[0]=='route'
      $('nav li').removeClass 'active'
      path = trigger[1].split('__')[0]
      $('nav li[action='+path+']').addClass 'active'
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

  profile_table__default: () -> @profile_table('Afghanistan')
  profile_table: (country='') ->
    @active = new ProfileView(country,'table')

  profile_grid: (country='') ->
    @active = new ProfileView(country,'grid')

  compare__all: (path='') ->
    @compare('',path)

  compare: (category,path='') ->
    # Split by / and remove empty strings
    path = path.split('/')
    path = _.filter path, _.identity
    @active = new CompareView(category,path)

  rankings__all_categories: (region) -> @rankings('',region)
  rankings: (category='',region='') ->
    @active = new RankingsView(category,region)

