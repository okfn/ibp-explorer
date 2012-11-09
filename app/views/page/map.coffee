template_page = require 'views/templates/page/map'

reportGenerator = require 'views/reportgenerator'

MAP_NAME = 'world_mill_en'
IBP_COLORS = [
  '#B7282E'
  '#F58024'
  '#DAC402'
  '#22aa33'
]

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
                scale: IBP_COLORS
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
        $('button[data-year="2010"]').click()

    ##################
    ## Private methods
    ##################
    _mapToggle: (e) =>
        target = $(e.delegateTarget)
        $('#map-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        @_repaint()

    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet) =>
        countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths
        @mapData = {}
        if reportGenerator.questionSet.length>0
            for country in dataset
                if not (country.alpha2 of countries_in_map)
                    # This country code isn't an available vector
                    #console.log 'Warning: Cannot map country '+k
                    continue
                @mapData[country.alpha2] = country[@year]
            # Repaint the map
            @mapObject.series.regions[0].setValues @_hackMinValue(@mapData,1)
        else
            for x of countries_in_map
                @mapData[x] = 0
            # Repaint the map
            @mapObject.series.regions[0].setValues @mapData


    _hackMinValue: (object, minValue) ->
        # Useful. jVectorMap will white out a country with a score of 0%
        out = {}
        for k,v of object
            out[k] = Math.max(minValue,v) 
        return out

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


