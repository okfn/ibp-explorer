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
    /*
    Create report data structure to drive timeline.

    Query reportGenerator for data from all years. Collect results together,
    only include countries found in the most recent year.
    */

    const filteredYearReport = function (year, countries) {
      // Return report object for year, filtered with `countries`.
      reportGenerator.update(year, false, true)
      const filteredDatasets = _.filter(reportGenerator.dataset, c =>
        _.contains(countries, c.alpha2)
      )
      const filteredDatasetsUnrounded = _.filter(reportGenerator.dataset_unrounded, c =>
        _.contains(countries, c.alpha2)
      )
      return {
        dataset: filteredDatasets,
        dataset_unrounded: _.clone(filteredDatasetsUnrounded)
      }
    }

    // Initialise our most recent year object
    reportGenerator.update(_EXPLORER_DATASET.THIS_YEAR, false, true)
    const lastReport = {
      dataset: reportGenerator.dataset,
      region: reportGenerator.region,
      dataset_unrounded: reportGenerator.dataset_unrounded
    }
    // List of country codes we're interested in.
    const latestCountries = _.pluck(lastReport.dataset, 'alpha2')

    // Get the old report, filtered for the countries we're interested in.
    // slice(0, -1) because we've already got the current year in lastReport
    const reportOld = filteredYearReport('2006', latestCountries)
    const reportsNew = _EXPLORER_DATASET.INDIVIDUAL_YEARS.slice(0, -1).map(
      y => filteredYearReport(y, latestCountries)
    )

    // Merge the report properties for latest, and old.
    const mergedDataset = _.map(lastReport.dataset, c => {
      const countryOld = _.find(reportOld.dataset, oc => oc.alpha2 === c.alpha2)
      const countriesNew = reportsNew.map(
        report => _.find(report.dataset, oc => oc.alpha2 === c.alpha2)
      )
      const currentName = { country: c.country }
      return _.extend(c, countryOld, ...countriesNew, currentName)
    })
    const mergedDatasetUnrounded = _.map(lastReport.dataset_unrounded, c => {
      const countryOld = _.find(reportOld.dataset_unrounded, oc => oc.alpha2 === c.alpha2)
      const countriesNew = reportsNew.map(
        report => _.find(report.dataset_unrounded, oc => oc.alpha2 === c.alpha2)
      )
      const currentName = { country: c.country }
      return _.extend(c, countryOld, ...countriesNew, currentName)
    })

    this.timelineReport = {
      dataset: mergedDataset,
      region: lastReport.region,
      dataset_unrounded: mergedDatasetUnrounded
    }
  }

  _onToggleMode() {
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

  _buildRankingTable(year, dataset, selectedCountries) {
    // Basic dataset
    const out = []
    _.forEach(dataset, (obj, country) => {
      if (!_.has(obj, year)) return
      if (!_.contains(selectedCountries, obj.alpha2)) return
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
    const selectedCountries = []
    const regions = _EXPLORER_DATASET.forYear(_EXPLORER_DATASET.THIS_YEAR).regions
    _.forEach(region, reg => {
      _.forEach(regions[reg].contains, contained => {
        selectedCountries.push(contained)
      })
    })
    let html = ''

    // always only take the 6 most recent years: that's all that will fit
    const years = _EXPLORER_DATASET.LEGACY_YEARS.concat(_EXPLORER_DATASET.INDIVIDUAL_YEARS).slice(-6)
    _.each(years, y => {
      const templ = (y === _.last(years)) ? template_timeline_column : template_timeline_column_abbr
      html += templ({
        year: y,
        data: this._buildRankingTable(y, dataset_unrounded, selectedCountries)
      })
    })
    target.html(html)
    target.find('tr').bind('mouseover', this._mouseoverRanking)
    if (!this.mouseoverAlpha2) {
      this.mouseoverAlpha2 = $(
        `#timeline-column-${_EXPLORER_DATASET.THIS_YEAR} tbody tr:first-child`
      ).attr('data-alpha2')
    }
    this._redrawJsPlumb()
    this._onToggleMode()
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
