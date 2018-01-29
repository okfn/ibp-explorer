import Backbone from 'backbone'
import _ from 'underscore'

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
    this.$el.html(template_page())
    target.html(this.$el)
    $('#year-toggles button').click(this._yearToggle)
    $('#year-compare-toggles button').click(this._yearCompareToggle)
    $('#year-toggles button[data-year="2017"]').click()
    $('#year-compare-toggles button[data-year="None"]').click()
    $('.av-region-toggler').click(this.clickRegion)
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
    let datasetRegions
    let datasetAv
    let countries
    let countriesExcluded
    let datasetAvCompare
    let countriesCompare
    let countriesCompareExcluded
    if (this.year === '2015') {
      datasetRegions = _EXPLORER_DATASET.regions_2015
      datasetAv = _EXPLORER_DATASET.availability_2015
      countries = _EXPLORER_DATASET.country_2015
      countriesExcluded = _EXPLORER_DATASET.excluded_country
    } else if (this.year === '2017') {
      datasetRegions = _EXPLORER_DATASET.regions_2017
      datasetAv = _EXPLORER_DATASET.availability_2017
      countries = _EXPLORER_DATASET.country_2017
      countriesExcluded = _EXPLORER_DATASET.excluded_country
    } else {
      datasetRegions = _EXPLORER_DATASET.regions_old
      datasetAv = _EXPLORER_DATASET.availability_old
      countries = _EXPLORER_DATASET.country_old
      countriesExcluded = _EXPLORER_DATASET.excluded_country_old
    }

    if (compareYear) {
      if (compareYear === '2015') {
        datasetAvCompare = _EXPLORER_DATASET.availability_2015
        countriesCompare = _EXPLORER_DATASET.country_2015
        countriesCompareExcluded = _EXPLORER_DATASET.excluded_country
      } else if (compareYear === '2017') {
        datasetAvCompare = _EXPLORER_DATASET.availability_2017
        countriesCompare = _EXPLORER_DATASET.country_2017
        countriesCompareExcluded = _EXPLORER_DATASET.excluded_country
      } else {
        datasetAvCompare = _EXPLORER_DATASET.availability_old
        countriesCompare = _EXPLORER_DATASET.country_old
        countriesCompareExcluded = _EXPLORER_DATASET.excluded_country_old
      }
    }

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
