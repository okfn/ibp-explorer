template_page = require 'views/templates/page/vectormap'

MAP_NAME = 'world_mill_en'

module.exports = class ProjectPage extends Backbone.View

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el

        @$el.find('#map').vectorMap {
          map: MAP_NAME
          series: {
            regions: [{
              values: @vectorMapData()
              scaleColors: ['#C8EEFF', '#0071A4']
              normalizeFunction: 'polynomial'
            }]
          }
          onLabelShow: (e, el, code)=> el.html(el.html()+' (GDP - '+gdpData[code]+')')
        }

    vectorMapData: =>
      countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths
      out = {}
      for k,v of window._EXPLORER_DATASET.country
          if not (v.alpha2 of countries_in_map)
              # This country code isn't an available vector
              #console.log 'Warning: Cannot map country '+k
              continue
          out[v.alpha2] = v.open_budget_index
      return out
