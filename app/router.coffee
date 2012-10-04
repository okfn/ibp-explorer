template_explorer = require 'views/templates/explorer'

HomePage = require 'views/page/home'
VectorMapPage = require 'views/page/vectormap'
RankingsPage = require 'views/page/rankings'
RawDataPage = require 'views/page/rawdata'

# Singleton report generator
reportGenerator = require 'views/reportgenerator'

# Function to consistently target the main div
# Generator of singleton view pages
singletons =
    homePage:  -> return @_home = @_home or new HomePage()
    vectorMapPage:  -> return @_vectorMap = @_vectorMap or new VectorMapPage()
    queryPage:  -> return @_query = @_query or new RankingsPage()
    rawDataPage:  -> return @_rawData = @_rawData or new RawDataPage()

module.exports = class Router extends Backbone.Router
    routes:
        '': 'home'
        'map' : 'vectorMap'
        'rankings' : 'rankings'
        'rawdata' : 'rawdata'

    initialize: ->
        # Trigger nav updates
        @on 'all', (trigger) =>
            location = (window.location.hash.slice(1))
            trigger = trigger.split(':')
            if trigger[0]=='route'
              $('ul.nav li').removeClass 'active'
              active = $('ul.nav li a[href$="#'+location+'"]')
              active = $(active.parents('li')[0])
              active.add( active.parents('.dropdown') ).addClass 'active'

    setCurrent: (view) =>
        if not (view==@currentView)
            @currentView = view
            $('#content').html template_explorer 
            reportGenerator.render $('#report-generator')
            reportGenerator.setInitialState()
            view.renderPage $('#explorer')

    home: ->
      @setCurrent singletons.homePage()
    vectorMap: ->
      @setCurrent singletons.vectorMapPage()
    rankings: ->
      @setCurrent singletons.queryPage()
    rawdata: ->
      @setCurrent singletons.rawDataPage()

