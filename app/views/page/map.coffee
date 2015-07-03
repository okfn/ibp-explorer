template_page = require 'views/templates/page/map'

reportGenerator = require 'views/reportgenerator'

MAP_NAME = 'world_mill_en'
COLOR_SCHEME = [
  'B8282E'
  'F48022'
  'DAC300'
  '007A78'
  '0065A4'
]

# Hack JVectorMap (it is horribly coded and worse documented, and I have a deadline)
jvm.NumericScale.prototype.getValue = (_x) -> 
    x = Math.min(_x-1,99) # Glitch fix: It's x<=20, not x<20
    x = (x - (x%20)) / 20
    x = COLOR_SCHEME[x]
    assert not (x==undefined), 'Could not process '+_x + ' ('+x+')'
    return x

module.exports = class ProjectPage extends Backbone.View
    mapData: {}
    countriesInSurvey: []

    ##################
    ## Public methods
    ##################
    initialize: =>
        reportGenerator.bind 'update', @_repaint

    renderPage: (target) =>
        $(window).scrollTop(0)
        @$el.html template_page()
        target.html @$el
        map = @$el.find('#map')
        x = map.vectorMap {
          map: MAP_NAME
          series: {
            regions: [{}]
          }
          regionStyle: 
              initial: 
                  stroke: 'none'
                  'stroke-width' : '1.0'
                  'stroke-opacity' : '0.5'
                  fill: '#cccccc'
          backgroundColor: '#ffffff'
          onRegionLabelShow: @_labelShow
          onRegionClick: @_clickCountry
          zoomOnScroll: false
        }
        @mapObject = map.vectorMap('get', 'mapObject')

        $('#map-toggles button').click @_mapToggle
        $('button[data-year="2015"]').click()
        ###
        # Debug gradient (usually a static PNG file)
        g = $('#map-gradient')
        s = '-webkit-linear-gradient(top, [C3] 0%,[C2] 33%,[C1] 66%,[C0] 100%)'
        for x in [0...SCHEME.length]
          s = s.replace('[C'+x+']', SCHEME[x])
        g.css('background',s)
        ###


    ##################
    ## Private methods
    ##################
    _mapToggle: (e) =>
        target = $(e.delegateTarget)
        lastYear = $('#map-toggles button.active').attr('data-year')
        currentYear = target.attr('data-year')
        newReport = (lastYear == '2015' || currentYear == '2015')
        $('#map-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        if newReport
            collapsed = false
            if $('#accordion2 .accordion-toggle').hasClass 'collapsed'
                collapsed = true
            reportGenerator.update(@year, collapsed)
        @_repaint()

    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) =>
        if @year != '2015'
            datasetRegions = _EXPLORER_DATASET.regions_old
        else
            datasetRegions = _EXPLORER_DATASET.regions
        countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths
        selected_countries = []
        for reg in region
            for contained in datasetRegions[reg].contains
                selected_countries.push(contained)
        # Unpaint the map
        @mapData = {}
        @mapColor = {}
        @countriesInSurvey = []
        for x of countries_in_map
            @mapData[x] = -1
            @mapColor[x] = 0
        if reportGenerator.questionSet.length>0
            for country in dataset
                if not (country.alpha2 of countries_in_map)
                    # This country code isn't an available vector
                    #console.log 'Warning: Cannot map country '+k
                    continue
                if not (country.alpha2 in selected_countries)
                    continue
                if not (@year of country)
                    # Was not surveyed this year
                    continue
                value = country[@year]
                if value < 0
                    # Score is N/A
                    continue
                assert value>=-1, 'Bad mapping value: '+value
                @countriesInSurvey.push country.alpha2
                # Frustrating hack; jVectorMap greys out a country that scores 0.
                # Thanks for making life hard, Myanmar.
                @mapColor[country.alpha2] = Math.max(1,value)
                # Mapdata is what appears in the textbox
                @mapData[country.alpha2] = value 
        # Repaint the map
        @mapObject.series.regions[0].setValues @mapColor

    _labelShow: (e,@mapLabel,code) =>
      if not (code in @countriesInSurvey)
          @mapLabel.css {'opacity':'0.5'}
      else
          @mapLabel.css {'opacity':'1.0'}
          @mapLabel.html(@mapLabel.html()+': '+@mapData[code])

    _clickCountry: (event, alpha2) =>
        if alpha2 in @countriesInSurvey
            if @mapLabel.length then @mapLabel.remove()
            window.location = '#profile/'+alpha2


