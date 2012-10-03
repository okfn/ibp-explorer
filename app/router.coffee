template_explorer = require 'views/templates/explorer'

HomePage = require 'views/page/home'
VectorMapPage = require 'views/page/vectormap'
QueryPage = require 'views/page/query'
RawDataPage = require 'views/page/rawdata'

# Function to consistently target the main div
content = -> $('#explorer')
# Generator of singleton view pages
singletons =
    homePage:  -> return @_home = @_home or new HomePage()
    vectorMapPage:  -> return @_vectorMap = @_vectorMap or new VectorMapPage()
    queryPage:  -> return @_query = @_query or new QueryPage()
    rawDataPage:  -> return @_rawData = @_rawData or new RawDataPage()

module.exports = class Router extends Backbone.Router
    routes:
        '': 'home'
        'map' : 'vectorMap'
        'query' : 'query'
        'rawdata' : 'rawdata'

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
            $('#content').html template_explorer 'helo'
            #view.renderPage content()

    home: ->
      @setCurrent singletons.homePage()
    vectorMap: ->
      @setCurrent singletons.vectorMapPage()
    query: ->
      @setCurrent singletons.queryPage()
    rawdata: ->
      @setCurrent singletons.rawDataPage()

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
