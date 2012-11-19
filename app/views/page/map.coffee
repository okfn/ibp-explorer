template_page = require 'views/templates/page/map'

reportGenerator = require 'views/reportgenerator'

MAP_NAME = 'world_mill_en'
IBP_COLOURS = [
  '#B8282E'
  '#F48022',
  '#DAC300',
  '#007A78',
  '#0065A4',
]
TRAFFIC_LIGHTS = [
  '#B7282E'
  '#F58024'
  '#DAC402'
  '#22aa33'
]
YELLOW_BLUE = [
  '#225ea8',
  '#41b6c4',
  '#a1dab4',
  '#ffffcc',
]
PURPLE = [
  '#6A51A3'
  '#9E9AC8'
  '#CBC9E2'
  '#F2F0F7'
]
RED = [
  '#D7301F',
  '#FC8D59',
  '#FDCC8A',
  '#FEF0D9'
]
GREEN = [
  '#002200',
  '#225500',
  '#44aa00',
  '#66cc00'
]
GREENRED = [
  '#aa0000',
  '#995500',
  '#44aa00',
  '#22cc00'
]

SCHEME = TRAFFIC_LIGHTS


module.exports = class ProjectPage extends Backbone.View
    mapData: {}

    ##################
    ## Public methods
    ##################
    initialize: =>
        reportGenerator.bind 'update', @_repaint

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el
        map = @$el.find('#map')
        map.vectorMap {
          map: MAP_NAME
          series: {
            regions: [{
                scale: SCHEME
            }
            ]
          }
          regionStyle: 
              initial: 
                  stroke: 'none'
                  'stroke-width' : '1.0'
                  'stroke-opacity' : '0.5'
                  fill: '#cccccc'
          backgroundColor: '#f0f0f0'
          onRegionLabelShow: @_labelShow
          onRegionClick: @_clickCountry
        }
        @mapObject = map.vectorMap('get', 'mapObject')
        $('#map-toggles button').click @_mapToggle
        $('button[data-year="2012"]').click()
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
        $('#map-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        @_repaint()

    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) =>
        countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths
        selected_countries = _EXPLORER_DATASET.regions[region].contains
        # Unpaint the map
        @mapData = {}
        for x of countries_in_map
            @mapData[x] = 0
        if reportGenerator.questionSet.length>0
            for country in dataset
                if not (country.alpha2 of countries_in_map)
                    # This country code isn't an available vector
                    #console.log 'Warning: Cannot map country '+k
                    continue
                if not (country.alpha2 in selected_countries)
                    continue
                @mapData[country.alpha2] = Math.max(1,country[@year])
        # Repaint the map
        @mapObject.series.regions[0].setValues @mapData

    _labelShow: (e,@mapLabel,code) =>
      if not (code of @mapData)
          @mapLabel.css {'opacity':'0.5'}
      else
          @mapLabel.css {'opacity':'1.0'}
          @mapLabel.html(@mapLabel.html()+': '+@mapData[code]+'%')

    _clickCountry: (event, alpha2) =>
        if alpha2 of @mapData
            if @mapLabel.length then @mapLabel.remove()
            window.location = '#profile/'+alpha2


