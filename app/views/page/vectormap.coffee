template_page = require 'views/templates/page/vectormap'

MAP_NAME = 'world_mill_en'

module.exports = class ProjectPage extends Backbone.View
    vectorMapData: {}

    initialize: =>
      countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths
      for k,v of window._EXPLORER_DATASET.country
          if not (v.alpha2 of countries_in_map)
              # This country code isn't an available vector
              #console.log 'Warning: Cannot map country '+k
              continue
          @vectorMapData[v.alpha2] = v.open_budget_index

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el

        map = @$el.find('#map')
        map.vectorMap {
          map: MAP_NAME
          series: {
            regions: [{
              values: @vectorMapData
              scaleColors: ['#C8EEFF', '#0071A4']
              normalizeFunction: 'polynomial'
            }]
          }
          onRegionLabelShow: @labelShow
        }

    labelShow: (e,el,code) =>
      if not (code of @vectorMapData)
          el.css {'opacity':'0.5'}
      else
          el.css {'opacity':'1.0'}
          el.html(el.html()+': '+@vectorMapData[code]+'%')

