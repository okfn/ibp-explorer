template_page = require 'views/templates/page/vectormap'

MAP_NAME = 'world_mill_en'

module.exports = class ProjectPage extends Backbone.View
    vectorMapData: {}
    vectorMapDeadzone: {}

    initialize: =>
      countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths
      coverage = []
      for k,v of window._EXPLORER_DATASET.country
          if not (v.alpha2 of countries_in_map)
              # This country code isn't an available vector
              #console.log 'Warning: Cannot map country '+k
              continue
          @vectorMapData[v.alpha2] = v.open_budget_index
          coverage.push v.alpha2
      for k,v of countries_in_map
          if not (k in coverage)
              @vectorMapDeadzone[k]=1

    hackMinValue: (object, minValue) ->
        # Useful. jVectorMap will white out a country with a score of 0%
        out = {}
        for k,v of object
            out[k] = Math.max(minValue,v) 
        return out

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el

        map = @$el.find('#map')
        map.vectorMap {
          map: MAP_NAME
          series: {
            regions: [{
              values: @hackMinValue(@vectorMapData,1)
              scale: ['#ff0000', '#ffff00', '#00ff00']
              min: 0
              max: 100
            }
            {
              values: @vectorMapDeadzone
              scale: ['#888888']
            }
            ]
          }
          onRegionLabelShow: @labelShow
        }

    labelShow: (e,el,code) =>
      if not (code of @vectorMapData)
          el.css {'opacity':'0.5'}
      else
          el.css {'opacity':'1.0'}
          el.html(el.html()+': '+@vectorMapData[code]+'%')

