import Backbone from 'backbone'
import _ from 'underscore'

import template_page from '../templates/page/availability_historical.hbs'
import template_row from '../templates/availability_row.hbs'
import reportGenerator from '../reportgenerator.js'

class ProjectPage extends Backbone.View {

  initialize() {
    this.regionId = [0]
    this.clickregion = _.bind(this.clickregion, this);
    this._repaint = _.bind(this._repaint, this);
    this._yearToggle = _.bind(this._yearToggle, this);
    this._yearCompareToggle = _.bind(this._yearCompareToggle, this);
    this.renderPage = _.bind(this.renderPage, this);
  }

  renderPage(target) {
    reportGenerator.update('2015', false)
    this.$el.html(template_page())
    target.html(this.$el)
    $('#year-toggles button').click(this._yearToggle)
    $('#year-compare-toggles button').click(this._yearCompareToggle)
    $('#year-toggles button[data-year="2015"]').click()
    $('#year-compare-toggles button[data-year="None"]').click()
    $('.av-region-toggler').click(this.clickregion)
  }

  // Private methods
  _yearToggle(e) {
    const target = $(e.delegateTarget)
    const lastYear = $('#year-toggles button.active').attr('data-year')
    const currentYear = target.attr('data-year')
    const newReport = lastYear === '2015' || currentYear === '2015'
    $('#year-toggles button').removeClass('active');
    target.addClass('active')
    this.year = $(e.delegateTarget).attr('data-year')
    if (newReport) {
      reportGenerator.update(this.year, false)
    }
    this._repaint()
  }

  _yearCompareToggle(e) {
    const target = $(e.delegateTarget)
    const lastYear = $('#year-compare-toggles button.active').attr('data-year')
    const currentYear = target.attr('data-year')
    const newReport = lastYear === '2015' || currentYear === '2015'
    $('#year-compare-toggles button').removeClass('active');
    target.addClass('active')
    this.yearCompare = $(e.delegateTarget).attr('data-year')
    this._repaint()
  }

  _findScore(countries, country, year) {
    return _.find(countries, x => (x.alpha2 === country))[`db_${year}`].roundobi
  }

  _repaint(dataset = reportGenerator.dataset,
           questionSet = reportGenerator.questionSet,
           region = reportGenerator.region) {
    let compareYear = null
    if (this.yearCompare !== 'None' && this.yearCompare !== undefined) {
      compareYear = this.yearCompare
    }

    const tbody = $('#overview-table tbody')
    tbody.empty()
    let datasetRegions
    let datasetAv
    let countries
    let datasetAvCompare
    let countriesCompare
    if (this.year !== '2015') {
      datasetRegions = _EXPLORER_DATASET.regions_old
      datasetAv = _EXPLORER_DATASET.availability_old
      countries = _EXPLORER_DATASET.country_old
    } else {
      datasetRegions = _EXPLORER_DATASET.regions
      datasetAv = _EXPLORER_DATASET.availability
      countries = _EXPLORER_DATASET.country
    }

    if (compareYear) {
      if (compareYear !== '2015') {
        datasetAvCompare = _EXPLORER_DATASET.availability_old
        countriesCompare = _EXPLORER_DATASET.country_old
      } else {
        datasetAvCompare = _EXPLORER_DATASET.availability
        countriesCompare = _EXPLORER_DATASET.country
      }
    }

    const countriesIncluded = []
    _.forEach(this.regionId, reg => {
      _.forEach(datasetRegions[reg].contains, (contained) => {
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
          compareObj.score = this._findScore(countriesCompare, country, compareYear)
        }
      }

      const context = {}
      context.obj = row[yearKey]
      context.obj.score = this._findScore(countries, country, this.year)
      context.obj.year = this.year
      if (compareObj) {
        context.compareObj = compareObj
        context.compareObj.year = compareYear
      }
      tbody.append(template_row(context))
    })
  }

  // TODO: change to camelcase
  clickregion(e) {
    e.preventDefault()
    let target = $(e.delegateTarget)
    const selected = parseInt(target.attr('id').replace('region-', ''))
    if (selected === 0) {
      this.regionId = [0]
      this.$el.find('.av-region-toggler').removeClass('active')
      target.addClass('active')
    } else {
      if (target.hasClass('active')) {
        target.removeClass('active')
        let index = this.regionId.indexOf(selected)
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
          let index = this.regionId.indexOf(0)
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
