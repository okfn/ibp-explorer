template_explorer = require 'views/templates/explorer'

MapPage = require 'views/page/map'
TimelinePage = require 'views/page/timeline'
RawDataPage = require 'views/page/rawdata'

# Singleton report generator
reportGenerator = require 'views/reportgenerator'

# Function to consistently target the main div
# Generator of singleton view pages
singletons =
    mapPage:  -> return @_map = @_map or new MapPage()
    timelinePage:  -> return @_timeline = @_timeline or new TimelinePage()
    rawDataPage:  -> return @_rawData = @_rawData or new RawDataPage()

module.exports = class Router extends Backbone.Router
    routes:
        '': 'map'
        'map' : 'map'
        'timeline' : 'timeline'
        'rawdata' : 'rawdata'

    initialize: ->
        # Create basic page
        $('#content').html template_explorer 
        reportGenerator.render $('#report-generator')
        reportGenerator.setInitialState()
        # Trigger nav updates
        @on 'all', (trigger) =>
            location = (window.location.hash.slice(1))
            trigger = trigger.split(':')
            if trigger[0]=='route'
              $('ul.nav li').removeClass 'active'
              location = location or trigger[1]
              active = $('ul.nav li a[href$="#'+location+'"]')
              active = $(active.parents('li')[0])
              active.add( active.parents('.dropdown') ).addClass 'active'

    setCurrent: (view) =>
        if not (view==@currentView)
            @currentView = view
            view.renderPage $('#explorer')

    home: ->
      @setCurrent singletons.homePage()
    map: ->
      @setCurrent singletons.mapPage()
    timeline: ->
      @setCurrent singletons.timelinePage()
    rawdata: ->
      @setCurrent singletons.rawDataPage()

