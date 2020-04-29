import Backbone from 'backbone'
import _ from 'underscore'
import floatThead from 'floatthead'

import template_page from '../templates/page/availability.hbs'
import template_row from '../templates/availability_row.hbs'

class ProjectPage extends Backbone.View {

  initialize() {
    this.regionId = [0]
    this.clickRegion = _.bind(this.clickRegion, this)
    this._repaint = _.bind(this._repaint, this)
    this._yearToggle = _.bind(this._yearToggle, this)
    this._yearCompareToggle = _.bind(this._yearCompareToggle, this)
    this.renderPage = _.bind(this.renderPage, this)
  }

  renderPage(target) {
    this.$el.html(template_page({
      button_years: _EXPLORER_DATASET.LEGACY_YEARS.concat(_EXPLORER_DATASET.INDIVIDUAL_YEARS),
    }))
    target.html(this.$el)
    $('#year-toggles button').click(this._yearToggle)
    $('#year-compare-toggles button').click(this._yearCompareToggle)
    $(`#year-toggles button[data-year="${_EXPLORER_DATASET.THIS_YEAR}"]`).click()
    $('#year-compare-toggles button[data-year="None"]').click()
    $('.av-region-toggler').click(this.clickRegion)
    $('table').floatThead()
  }

  // Private methods
  _yearToggle(e) {
    const target = $(e.delegateTarget)
    const lastYear = $('#year-toggles button.active').attr('data-year')
    const currentYear = target.attr('data-year')
    const newReport = (lastYear !== currentYear)
    if (newReport) {
      $('#year-toggles button').removeClass('active')
      target.addClass('active')
      this.year = $(e.delegateTarget).attr('data-year')
      this._repaint()
    }
  }

  _yearCompareToggle(e) {
    const target = $(e.delegateTarget)
    const lastYear = $('#year-compare-toggles button.active').attr('data-year')
    const currentYear = target.attr('data-year')
    const newReport = (lastYear !== currentYear)
    if (newReport) {
      $('#year-compare-toggles button').removeClass('active')
      target.addClass('active')
      this.yearCompare = $(e.delegateTarget).attr('data-year')
      this._repaint()
    }
  }

  _findScore(countries, excludedCountries, country, year) {
    /*
    Find the score for the country/year in either `countries` or `excludedCountries`.
    */
    try {
      return _.find(countries, x => (x.alpha2 === country))[`db_${year}`].roundobi
    } catch (err) {
      return _.find(excludedCountries, x => (x.alpha2 === country))[`db_${year}`].roundobi
    }
  }

  _repaint() {
    let compareYear = null
    if (this.yearCompare !== 'None' && this.yearCompare !== undefined
        && this.yearCompare !== this.year) {
      compareYear = this.yearCompare
    }

    const tbody = $('#overview-table tbody')
    tbody.empty()
    let datasetRegions = _EXPLORER_DATASET.forYear(this.year).regions
    let datasetAv = _EXPLORER_DATASET.forYear(this.year).availability
    let countries = _EXPLORER_DATASET.forYear(this.year).country
    let countriesExcluded = _EXPLORER_DATASET.forYear(this.year).excluded_country
    let datasetAvCompare = _EXPLORER_DATASET.forYear(compareYear).availability
    let countriesCompare = _EXPLORER_DATASET.forYear(compareYear).country
    let countriesCompareExcluded = _EXPLORER_DATASET.forYear(compareYear).excluded_country

    const countriesIncluded = []
    _.forEach(this.regionId, reg => {
      _.forEach(datasetRegions[reg].contains, contained => {
        countriesIncluded.push(contained)
      })
    })

    _.forEach(datasetAv, row => {
      const yearKey = `db_${this.year}`

      if (!(_.has(row, yearKey))) return
      if (!(_.contains(countriesIncluded, row[yearKey].alpha2))) return
      const country = row[yearKey].alpha2

      let compareObj = null
      if (compareYear) {
        const comparisonYearKey = `db_${compareYear}`
        // find comparison obj corresponding with `row` country and comparison year.
        const comparisonRow = _.find(datasetAvCompare, cRow =>
          (_.has(cRow, comparisonYearKey) && cRow[comparisonYearKey].alpha2 === country)
        )
        if (comparisonRow) {
          compareObj = comparisonRow[comparisonYearKey]
          compareObj.score = this._findScore(countriesCompare, countriesCompareExcluded,
                                             country, compareYear)
        }
      }

      const context = {}
      context.obj = row[yearKey]
      context.obj.score = this._findScore(countries, countriesExcluded, country, this.year)
      context.obj.year = this.year
      context.obj.pre2017 = (this.year < 2017)
      if (compareObj) {
        context.compareObj = compareObj
        context.compareObj.year = compareYear
        context.compareObj.pre2017 = (compareYear < 2017)
      }
      tbody.append(template_row(context))
    })
  }

  clickRegion(e) {
    e.preventDefault()
    const target = $(e.delegateTarget)
    const selected = parseInt(target.attr('id').replace('region-', ''))
    if (selected === 0) {
      this.regionId = [0]
      this.$el.find('.av-region-toggler').removeClass('active')
      target.addClass('active')
    } else {
      if (target.hasClass('active')) {
        target.removeClass('active')
        const index = this.regionId.indexOf(selected)
        if (index >= 0) {
          this.regionId.splice(index, 1)
        }
        if (this.regionId.length === 0) {
          this.regionId.push(0)
          this.$el.find('#region-0.av-region-toggler').addClass('active')
        }
      } else {
        if (this.$el.find('#region-0.av-region-toggler').hasClass('active')) {
          this.$el.find('#region-0.av-region-toggler').removeClass('active')
          const index = this.regionId.indexOf(0)
          if (index >= 0) {
            this.regionId.splice(index, 1)
          }
        }
        this.regionId.push(selected)
        target.addClass('active')
      }
    }
    this._repaint()
    return false
  }

}

export default ProjectPage
