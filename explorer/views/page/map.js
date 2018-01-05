'use strict'

import { View } from 'backbone'
import _ from 'underscore'
import jvm from 'exports?jvm!jvm'
import template_page from '../templates/page/map.hbs'
import reportGenerator from '../reportgenerator.js'

const MAP_NAME = 'world_mill_en'
const COLOR_SCHEME = [
  'B8282E',
  'F48022',
  'DAC300',
  '007A78',
  '0065A4'
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
    reportGenerator.bind('update', this._repaint)
  }

  renderPage(target) {
    $(window).scrollTop(0)
    this.$el.html(template_page())
    target.html(this.$el)
    let map = this.$el.find('#map')
    const x = map.vectorMap({
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
    $('#map-toggles button').click(this._mapToggle)
    $('button[data-year="2015"]').click()

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
    const newReport = lastYear === '2015' || currentYear === '2015'
    $('#map-toggles button').removeClass('active')
    target.addClass('active')
    this.year = $(e.delegateTarget).attr('data-year')
    let collapsed
    if (newReport) {
      collapsed = false
      if ($('#accordion2 .accordion-body').hasClass('in')) {
        collapsed = true
      }
      reportGenerator.update(this.year, collapsed)
    }
    this._repaint()
  }

  _repaint(dataset = reportGenerator.dataset,
           questionSet = reportGenerator.questionSet,
           region = reportGenerator.region) {
    var contained, country, i, j, k, len, len1, len2, ref, ref1, reg, stcolor, value, x;
    let datasetRegions
    if (this.year !== '2015') {
      datasetRegions = _EXPLORER_DATASET.regions_old
    } else {
      datasetRegions = _EXPLORER_DATASET.regions_2015
    }
    const countries_in_map = jvm.WorldMap.maps[MAP_NAME].paths
    let selected_countries = []
    _.forEach(region, (reg) => {
      _.forEach(datasetRegions[reg].contains, (contained) => {
        selected_countries.push(contained)
      })
    })
    this.mapData = {}
    this.mapColor = {}
    this.countriesInSurvey = []
    this.countriesInSurvey = []
    _.forEach(countries_in_map, (obj, key) => {
      this.mapData[key] = -1
      this.mapColor[key] = 0
    })
    if (reportGenerator.questionSet.length > 0) {
      _.forEach(dataset, (country) => {
        if (!(_.has(countries_in_map, country.alpha2) && country.alpha2 !== 'ST')) return
        if (!(_.contains(selected_countries, country.alpha2))) return
        if (!(_.has(country, this.year))) return
        let value = country[this.year]
        if (value < 0) {
          return
        }
        assert(value >= -1, 'Bad mapping value: ' + value)
        this.countriesInSurvey.push(country.alpha2)
        this.mapColor[country.alpha2] = Math.max(1, value)
        this.mapData[country.alpha2] = value
      })
    }
    // Repaint the map
    this.mapObject.series.regions[0].setValues(this.mapColor)
    stcolor = (stcolor - (stcolor % 20)) / 20
    stcolor = COLOR_SCHEME[stcolor]
    this.mapObject.removeAllMarkers
    this.mapObject.addMarker(0, {
      latLng: [0.33, 6.73],
      name: 'São Tomé e Príncipe'
    }, [this.mapColor['ST']])
  }

  _labelShow(e, mapLabel, code) {
    this.mapLabel = mapLabel

    if ((!(_.contains(this.countriesInSurvey, code)) && code !== '0') || (code === '0' && this.year === '2006')) {
      this.mapLabel.css({
        'opacity': '0.5'
      })
    } else if (code === '0' && this.year !== '2006') {
      this.mapLabel.css({
        'opacity': '1.0'
      })
      this.mapLabel.html(this.mapLabel.html() + ': ' + this.mapData['ST'])
    } else {
      this.mapLabel.css({
        'opacity': '1.0'
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
    if (alpha2 === '0' && _.contains(this.countriesIncluded, 'ST')) {
      if (this.mapLabel.length) {
        this.mapLabel.remove()
      }
      window.location = '#profile/ST';
    }
  }
}

export default ProjectPage
