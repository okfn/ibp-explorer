HomePage = require 'views/page/home'
GoogleMapPage = require 'views/page/googlemap'
VectorMapPage = require 'views/page/vectormap'

# Function to consistently target the main div
content = -> $('#content')
# Generator of singleton view pages
singletons =
    homePage:  -> return @_home = @_home or new HomePage()
    googleMapPage:  -> return @_googleMap = @_googleMap or new GoogleMapPage()
    vectorMapPage:  -> return @_vectorMap = @_vectorMap or new VectorMapPage()

module.exports = class Router extends Backbone.Router
    routes:
        '': 'home'
        'map/google' : 'googleMap'
        'map/vector' : 'vectorMap'

    initialize: ->
        # Trigger nav updates
        @on 'all', (trigger) =>
            location = (window.location.hash.slice(1))
            trigger = trigger.split(':')
            if trigger[0]=='route'
              $('.navbar .nav li').removeClass 'active'
              active = $('.navbar .nav li a[href="#'+location+'"]')
              active = $(active.parents('li')[0])
              active.add( active.parents('.dropdown') ).addClass 'active'

    setCurrent: (view) =>
        if not (view==@currentView)
            @currentView = view
            view.renderPage content()

    home: ->
      @setCurrent singletons.homePage()
    googleMap: ->
      @setCurrent singletons.googleMapPage()
    vectorMap: ->
      @setCurrent singletons.vectorMapPage()

###
    project: (projectName='okfn') ->
        view = singletons.projectPage()
        if not view==@currentView
            @currentView = view
        view.renderPage content(), projectName
    github: (graphMode='watchers') ->
        @setCurrent singletons.githubView()
        singletons.githubView().showGraph graphMode
###
