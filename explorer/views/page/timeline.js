'use strict'

import { View } from 'backbone'
import _ from 'underscore'
import $ from 'jquery'

import template_page from '../templates/page/timeline.hbs'
import template_timeline_column from '../templates/timeline_column.hbs'
import template_timeline_column_abbr from '../templates/timeline_column_abbr.hbs'
import * as util from '../../util.js'

import reportGenerator from '../reportgenerator.js'

class TimelinePage extends View {

  initialize() {
    this._redrawJsPlumb = _.bind(this._redrawJsPlumb, this)
    this._mouseoverRanking = _.bind(this._mouseoverRanking, this)
    this._updateReport = _.bind(this._updateReport, this)
    this._buildRankingTable = _.bind(this._buildRankingTable, this)
    this._onToggleMode = _.bind(this._onToggleMode, this)
    this._initializeReport = _.bind(this._initializeReport, this)
    this.renderPage = _.bind(this.renderPage, this)
    this.initialize = _.bind(this.initialize, this)
    this._initializeReport()
  }

  renderPage(target) {
    $(window).scrollTop(0)
    this.$el.html(template_page())
    target.html(this.$el)
    $('input[name="timeline"]').bind('change', this._onToggleMode)
    this._updateReport()
  }

  _initializeReport() {
    reportGenerator.update('2015', false, true)
    const lastReport = {
      dataset: reportGenerator.dataset,
      region: reportGenerator.region,
      dataset_unrounded: reportGenerator.dataset_unrounded
    }
    reportGenerator.update('2006', false, true)
    const oldReport = {
      dataset: reportGenerator.dataset,
      dataset_unrounded: reportGenerator.dataset_unrounded
    }
    this.timelineReport = {
      dataset: [],
      region: lastReport.region,
      dataset_unrounded: []
    }
    _.forEach(lastReport.dataset_unrounded, (countryLast) => {
      let countryFound = false
      _.forEach(oldReport.dataset_unrounded, (countryOld) => {
        if (countryLast.alpha2 === countryOld.alpha2) {
          countryFound = true
          const obj = {
            alpha2: countryLast.alpha2,
            country: countryLast.country
          }
          if ('2006' in countryOld) {
            obj['2006'] = countryOld['2006']
          }
          if ('2008' in countryOld) {
            obj['2008'] = countryOld['2008']
          }
          if ('2010' in countryOld) {
            obj['2010'] = countryOld['2010']
          }
          if ('2012' in countryOld) {
            obj['2012'] = countryOld['2012']
          }
          obj['2015'] = countryLast['2015']
          this.timelineReport.dataset_unrounded.push(obj)
        }
      })
      if (!countryFound) {
        const obj = {
          alpha2: countryLast.alpha2,
          country: countryLast.country
        }
        obj['2015'] = countryLast['2015']
        this.timelineReport.dataset_unrounded.push(obj)
      }
    })
    _.forEach(lastReport.dataset, (countryLast) => {
      let countryFound = false
      _.forEach(oldReport.dataset, (countryOld) => {
        if (countryLast.alpha2 === countryOld.alpha2) {
          countryFound = true
          const obj = {
            alpha2: countryLast.alpha2,
            country: countryLast.country
          }
          if ('2006' in countryOld) {
            obj['2006'] = countryOld['2006']
          }
          if ('2008' in countryOld) {
            obj['2008'] = countryOld['2008']
          }
          if ('2010' in countryOld) {
            obj['2010'] = countryOld['2010']
          }
          if ('2012' in countryOld) {
            obj['2012'] = countryOld['2012']
          }
          obj['2015'] = countryLast['2015']
          this.timelineReport.dataset.push(obj)
        }
      })
      if (!countryFound) {
        const obj = {
          alpha2: countryLast.alpha2,
          country: countryLast.country
        }
        obj['2015'] = countryLast['2015']
        this.timelineReport.dataset.push(obj)
      }
    })
  }

  _onToggleMode(showRank = true) {
    const value = $('input[name="timeline"]:checked').val()
    assert (value === 'rankings' || value === 'scores')
    if (value === 'rankings') {
      $('.timeline-cell-score').hide()
      $('.timeline-cell-rank').show()
    } else {
      $('.timeline-cell-rank').hide()
      $('.timeline-cell-score').show()
    }
  }

  _buildRankingTable(year, dataset, selected_countries) {
    // Basic dataset
    const out = []
    _.forEach(dataset, (obj, country) => {
      if (!_.has(obj, year)) return
      if (!_.contains(selected_countries, obj.alpha2)) return
      obj.score = obj[year]
      out.push(obj)
    })
    out.sort(util.sortFunction)
    let rank = 0
    let latest = 999
    let n = 0
    const tagDuplicates = []
    _.forEach(out, (x) => {
      n += 1
      if (x.score < latest) {
        latest = x.score
        rank = n
      } else {
        tagDuplicates.push(x.score)
      }
      x.rank = rank
    })
    // Append an equals sign where scores are neck-and-neck
    _.forEach(out, (x) => {
      if (x.score < 0) {
        x.rank = 'N/A'
        x.score = 'N/A'
      }
      if (_.contains(tagDuplicates, x.score)) {
        x.rank = '= ' + x.rank
      }
      x.score = Math.round(x.score)
    })
    return out
  }

  _updateReport(dataset = this.timelineReport.dataset,
                region = this.timelineReport.region,
                dataset_unrounded = this.timelineReport.dataset_unrounded) {
    const target = $('#timeline-columns')
    if (target.length === 0) return
    let html = ''
    const selectedCountries = []
    _.forEach(region, (reg) => {
      _.forEach(_EXPLORER_DATASET.regions_2015[reg].contains, (contained) => {
        selectedCountries.push(contained)
      })
    })
    _.forEach([2006, 2008, 2010, 2012], (year) => {
      html += template_timeline_column_abbr({
        year: year,
        data: this._buildRankingTable(year, dataset_unrounded, selectedCountries)
      })
    })
    html += template_timeline_column({
      year: 2015,
      data: this._buildRankingTable(2015, dataset_unrounded, selectedCountries)
    })
    target.html(html)
    target.find('tr').bind('mouseover', this._mouseoverRanking)
    if (!this.mouseoverAlpha2) {
      this.mouseoverAlpha2 = $('#timeline-column-2015 tbody tr:first-child').attr('data-alpha2')
    }
    this._redrawJsPlumb()
    return this._onToggleMode()
  }

  _mouseoverRanking(e) {
    const el = $(e.delegateTarget)
    const alpha2 = el.attr('data-alpha2')
    if (alpha2 && !(alpha2 === this.mouseoverAlpha2)) {
      this._redrawJsPlumb(alpha2)
    }
  }

  _redrawJsPlumb(alpha2 = null) {
    if (alpha2) {
      this.mouseoverAlpha2 = alpha2
    }
    $('.hover').removeClass('hover')
    const els = $('.timeline-row-' + this.mouseoverAlpha2)
    if (!els.length) return
    els.addClass('hover')
    jsPlumb.deleteEveryEndpoint()
    // This is expensive, so hold off until the mouse has settled for a few ms
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(function () {
      _.forEach(_.range(els.length - 1), (x) => {
        jsPlumb.connect({
          source: els[x],
          target: els[x + 1],
          overlays: jsPlumb._custom_overlay
        })
      })
      this.timeout = null
    }, 50)
  }
}


export default TimelinePage
