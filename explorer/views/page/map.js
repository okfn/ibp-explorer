'use strict'

import { View } from 'backbone'
import _ from 'underscore'
import jvm from 'exports?jvm!jvm'
import template_page from '../templates/page/map.hbs'
import reportGenerator from '../reportgenerator.js'

const MAP_NAME = 'world_mill_en'
const COLOR_SCHEME = [
  '5C111B',
  'AF1F24',
  'FDB721',
  '1F9E79',
  '0B6866'
]
// Hack JVectorMap (it is horribly coded and worse documented, and I have a deadline)
jvm.NumericScale.prototype.getValue = (_x) => {
  let x = Math.min(_x - 1, 99)
  x = (x - (x % 20)) / 20
  x = COLOR_SCHEME[x]
  assert(!(x === void 0), 'Could not process ' + _x + ' (' + x + ')')
  return x
}

class ProjectPage extends View {

  initialize() {
    this.mapData = {}
    this.countriesInSurvey = {}
    this._clickCountry = _.bind(this._clickCountry, this)
    this._labelShow = _.bind(this._labelShow, this)
    this._repaint = _.bind(this._repaint, this)
    this._mapToggle = _.bind(this._mapToggle, this)
    this.renderPage = _.bind(this.renderPage, this)
    this.initialize = _.bind(this.initialize, this)
    reportGenerator.unbind('update')
    reportGenerator.bind('update', this._repaint)
  }

  renderPage(target) {
    $(window).scrollTop(0)
    this.$el.html(template_page({
      button_years: _EXPLORER_DATASET.LEGACY_YEARS.concat(_EXPLORER_DATASET.INDIVIDUAL_YEARS),
    }))
    target.html(this.$el)
    const map = this.$el.find('#map')
    map.vectorMap({
      map: MAP_NAME,
      series: {
        regions: [{}],
        markers: [{}]
      },
      regionStyle: {
        initial: {
          stroke: 'none',
          'stroke-width': '1.0',
          'stroke-opacity': '0.5',
          fill: '#cccccc'
        }
      },
      backgroundColor: '#ffffff',
      onRegionLabelShow: this._labelShow,
      onRegionClick: this._clickCountry,
      zoomOnScroll: false,
      markerStyle: {
        initial: {
          fill: '#cccccc',
          stroke: 'none',
          'stroke-width': '1.0',
          'stroke-opacity': '0.5'
        },
        hover: {
          stroke: 'none',
          'fill-opacity': '0.8'
        }
      },
      markers: [],
      onMarkerLabelShow: this._labelShow,
      onMarkerClick: this._clickCountry
    })
    this.mapObject = map.vectorMap('get', 'mapObject')

    // HACK: manually fiddle some of the JVectorMap country names
    this.mapObject.series.regions[0].elements.SZ.config.name = 'Eswatini';
    this.mapObject.series.regions[0].elements.GM.config.name = 'The Gambia';
    this.mapObject.series.regions[0].elements.CI.config.name = "C\u00f4te d'Ivoire";

    $('#map-toggles button').click(this._mapToggle)
    $(`button[data-year="${_EXPLORER_DATASET.THIS_YEAR}"]`).click()

    /*
     * Debug gradient (usually a static PNG file)
     g = $('#map-gradient')
     s = '-webkit-linear-gradient(top, [C3] 0%,[C2] 33%,[C1] 66%,[C0] 100%)'
     for x in [0...SCHEME.length]
     s = s.replace('[C'+x+']', SCHEME[x])
     g.css('background',s)
     */
  }

  // Private methods

  _mapToggle(e) {
    const target = $(e.delegateTarget)
    const lastYear = $('#map-toggles button.active').attr('data-year')
    const currentYear = target.attr('data-year')
    const newReport = (lastYear !== currentYear)
    $('#map-toggles button').removeClass('active')
    target.addClass('active')
    this.year = $(e.delegateTarget).attr('data-year')
    if (newReport) {
      let collapsed = false
      if ($('#accordion2 .accordion-body').hasClass('in')) {
        collapsed = true
      }
      reportGenerator.update(this.year, collapsed)
    }
  }

  _repaint(dataset = reportGenerator.dataset,
           questionSet = reportGenerator.questionSet,
           region = reportGenerator.region) {
    let stcolor
    let datasetRegions = _EXPLORER_DATASET.forYear(this.year).regions
    const countriesInMap = jvm.WorldMap.maps[MAP_NAME].paths
    const selectedCountries = []
    _.forEach(region, reg => {
      _.forEach(datasetRegions[reg].contains, contained => {
        selectedCountries.push(contained)
      })
    })
    this.mapData = {}
    this.mapColor = {}
    this.countriesInSurvey = []
    _.forEach(countriesInMap, (obj, key) => {
      this.mapData[key] = -1
      this.mapColor[key] = 0
    })
    if (reportGenerator.questionSet.length > 0) {
      _.forEach(dataset, country => {
        // if (!(_.has(countriesInMap, country.alpha2))) {
        //   console.log(`Country not in map: ${country.country}`)
        // }
        if (!(_.contains(selectedCountries, country.alpha2))) return
        if (!(_.has(country, this.year))) return
        const value = country[this.year]
        if (value < 0) return
        assert(value >= -1, 'Bad mapping value: ' + value)
        this.countriesInSurvey.push(country.alpha2)
        this.mapColor[country.alpha2] = Math.max(1, value)
        this.mapData[country.alpha2] = value
      })
    }
    // Repaint the map
    this.mapObject.series.regions[0].setValues(this.mapColor)
    // console.log(this.circlePath(-10, 43.33330000000001, 1))
  }

  circlePath(lat, lng, r){
    // A simple function to take a lat/long and return an x/y coord. Helps to
    // place small islands to manually add to the world mill map.
    const p = this.mapObject.latLngToPoint(lat, lng)
    return 'M '+p.x+' '+p.y+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0';
  }

  _labelShow(e, mapLabel, code) {
    this.mapLabel = mapLabel

    if (!_.contains(this.countriesInSurvey, code)) {
      this.mapLabel.css({
        opacity: '0.5'
      })
    } else {
      this.mapLabel.css({
        opacity: '1.0'
      })
      this.mapLabel.html(this.mapLabel.html() + ': ' + this.mapData[code])
    }
  }

  _clickCountry(event, alpha2) {
    if (_.contains(this.countriesInSurvey, alpha2)) {
      if (this.mapLabel.length) {
        this.mapLabel.remove()
      }
      window.location = '#profile/' + alpha2
    }
  }
}

export default ProjectPage
