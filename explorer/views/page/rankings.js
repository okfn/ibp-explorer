import { View } from 'backbone'
import _ from 'underscore'
import $ from 'jquery'

import template_page from '../templates/page/rankings.hbs'
import template_rankings_row from '../templates/rankings_row.hbs'
import template_rankings_tooltip from '../templates/rankings_tooltip.hbs'
import * as util from '../../util.js'

import reportGenerator from '../reportgenerator.js'

const IBP_COLORS = [
  '#B7282E',
  '#F58024',
  '#DAC402',
  '#22aa33'
]

class ProjectPage extends View {

  initialize() {
    // TODO: find better workaround
    this.sortByName = false
    this._reflow = _.bind(this._reflow, this)
    this._sortByNameToggle = _.bind(this._sortByNameToggle, this)
    this._rankingsToggle = _.bind(this._rankingsToggle, this)
    this.renderPage = _.bind(this.renderPage, this)
    this.initialize = _.bind(this.initialize, this)
    reportGenerator.bind('update', this._reflow)
  }

  renderPage(target) {
    $(window).scrollTop(0)
    this.$el.html(template_page())
    target.html(this.$el)
    $('.sortbyname').click(this._sortByNameToggle)
    $('.sortbyname[data-sortbyname="' + this.sortByName + '"]').addClass('active')
    $('#rankings-toggles button').click(this._rankingsToggle)
    $('button[data-year="2015"]').click()
  }

  //Private methods
  _rankingsToggle(e) {
    let target = $(e.delegateTarget)
    let lastYear = $('#rankings-toggles button.active').attr('data-year')
    let currentYear = target.attr('data-year')
    let newReport = (lastYear === '2015' || currentYear === '2015')
    $('#rankings-toggles button').removeClass('active')
    target.addClass('active')
    this.year = $(e.delegateTarget).attr('data-year')
    if (newReport) {
      let collapsed = false
      if ($('#accordion2 .accordion-body').hasClass('in')) {
        collapsed = true
      }
      reportGenerator.update(this.year, collapsed)
    }
    this._reflow()
  }

  _count(array, search, questionSet) {
    let total = 0
    _.each(questionSet, q => {
      if (array[q] === search) total++
    })
    return total
  }

  _findScore(dataset, country, year) {
    const score = _.find(dataset, (x) => {
      return x.alpha2 === country
    })
    return score[year] || false
  }

  _sortByNameToggle(e) {
    e.preventDefault()
    let target = $(e.delegateTarget)
    $('.sortbyname').removeClass('active')
    target.addClass('active')
    this.sortByName = target.attr('data-sortbyname') === 'true'
    this._reflow()
    return false
  }

  _reflow(dataset = reportGenerator.dataset, questionSet = reportGenerator.questionSet, region = reportGenerator.region) {
    let obj, el
    let datasetRegions
    let datasetCountry
    if (this.year != 2015) {
      datasetRegions = _EXPLORER_DATASET.regions_old
      datasetCountry = _EXPLORER_DATASET.country_old
    } else {
      datasetRegions = _EXPLORER_DATASET.regions_2015
      datasetCountry = _EXPLORER_DATASET.country_2015
    }
    let target = $('#rankings-table tbody').empty()
    if (questionSet.length === 0) {
      target.html('<p style="margin: 4px 15px; font-weight: bold; min-width: 400px;">(No questions selected)</p>')
      return
    }
    let data = []
    let selected_countries = []

    _.forEach(region, (reg) => {
      _.forEach(datasetRegions[reg].contains, (contained) => {
        selected_countries.push(contained)
      })
    })

    _.forEach(datasetCountry, (country) => {
      if (!(_.has(country, 'db_' + this.year))) {
        return
      }
      if (!(_.contains(selected_countries, country.alpha2))) {
        return
      }

      const db = country['db_' + this.year]
      obj = {
        country: country.name,
        alpha2: country.alpha2,
        score: this._findScore(dataset, country.alpha2, this.year) || '',
        a: this._count(db, 100, questionSet),
        b: this._count(db, 67, questionSet),
        c: this._count(db, 33, questionSet),
        d: this._count(db, 0, questionSet),
        e: this._count(db, -1, questionSet)
      }
      obj.total = obj.a + obj.b + obj.c + obj.d + obj.e
      obj.a_width = (obj.a * 100) / obj.total
      obj.b_width = (obj.b * 100) / obj.total
      obj.c_width = (obj.c * 100) / obj.total
      obj.d_width = (obj.d * 100) / obj.total
      obj.e_width = (obj.e * 100) / obj.total
      obj.b_left = obj.a_width
      obj.c_left = obj.b_width + obj.b_left
      obj.d_left = obj.c_width + obj.c_left
      obj.e_left = obj.d_width + obj.d_left
      data.push(obj)
    })

    if (this.sortByName) {
      data.sort(util.sortFunctionByName)
    } else {
      data.sort(util.sortFunction)
    }
    _.forEach(data, (obj) => {
      if (obj.score < 0) {
        obj.score = 'N/A'
      }
      el = $(template_rankings_row(obj)).appendTo(target)
    })

    $('.percentbar').tooltip({
      placement: 'right',
      delay: 50,
      animation: true
    })
  }
}


export default ProjectPage
