'use strict'

import _ from 'underscore'

import template_page from '../templates/page/profile.hbs'
import template_profile_percentages from '../templates/profile_percentages.hbs'
import template_profile_details from '../templates/profile_details.hbs'
import template_question_text from '../templates/question_text.hbs'
import template_profile_badges from '../templates/profile_badges.hbs'

import reportGenerator from '../reportgenerator.js'


class ProfilePage extends Backbone.View {

  initialize(alpha2, params) {
    this._repaint = _.bind(this._repaint, this)
    this._yearToggle = _.bind(this._yearToggle, this)
    this.renderPage = _.bind(this.renderPage, this)
    this.initialize = _.bind(this.initialize, this)
    this.alpha2 = alpha2 || ''
    this.year = '2017'
    this.years = [2017]
    this.data = this.lookup(this.alpha2)
    this.params = this._decodeParams(params)
    this.db_2017 = $.extend({}, this.data.db_2015, this.params)
    // `initialize` gets called when the country dropdown is changed (page is
    // rerendered), so we want to unbind here, incase this has been bound
    // before, to prevent unnecessary _repaints.
    reportGenerator.unbind('update')
    reportGenerator.bind('update', this._repaint)
  }

  _decodeParams(queryString) {
    const params = {}
    let tmpObj
    if (queryString) {
      _.each(
        _.map(decodeURI(queryString).split(/&/g), (el, i) => {
          const aux = el.split('=')
          let val
          tmpObj = {}
          if (aux.length >= 1) {
            if (aux.length === 2) {
              if (_.contains(['100', '67', '33', '0', '-1'], aux[1])) {
                val = parseInt(aux[1])
              } else {
                return
              }
            }
            tmpObj[aux[0]] = val
          }
          return tmpObj
        }),
        function (tmpObj) {
          if (tmpObj) {
            _.extend(params, tmpObj)
          }
        }
      )
    }
    return params
  }

  _encodeParams(paramsObj) {
    let paramsStr = ''
    _.forEach(paramsObj, (val, key) => {
      if (val) {
        paramsStr = `${paramsStr}${key}=${val}&`
      }
    })
    return paramsStr.slice(0, -1)
  }

  lookup(alpha2) {
    /*
    Look up a country object by alpha2 code.
    */
    if (this.year === '2015') {
      return _.find(_EXPLORER_DATASET.country_2015, x => x.alpha2 === alpha2) || {}
    } else if (this.year === '2017') {
      return _.find(_EXPLORER_DATASET.country_2017, x => x.alpha2 === alpha2) || {}
    } else {
      // 'Old' data already has 2006-2012 combined.
      return _.find(_EXPLORER_DATASET.country_old, x => x.alpha2 === alpha2) || {}
    }
  }

  renderPage(target) {
    let collapsed = false
    if ($('#accordion2 .accordion-body').hasClass('in')) {
      collapsed = true
    }
    this.year =
      $('#datasheet-toggles button.active').attr('data-year') || '2017'
    $(window).scrollTop(0)
    const renderData = {
      alpha2: this.alpha2,
      countries: _EXPLORER_DATASET.country_2017,
      data: this.data,
      empty: this.alpha2 === '',
      main_website_url: this._ibpWebsiteUrl(this.alpha2),
      years: this.years
    }
    this.viewPast = true
    this.$el.html(template_page(renderData))
    target.html(this.$el)
    // Set up nav
    const nav = this.$el.find('.country-nav-select')
    nav.chosen()
    nav.val(this.alpha2).trigger('chosen:updated')
    nav.bind('change', this._onNavChange)
    $('#datasheet-toggles button').click(this._yearToggle)
    if (this.year === '2015') {
      $('button[data-year="2015"]').click()
    } else if (this.year === '2017') {
      $('button[data-year="2017"]').click()
    } else {
      $('button[data-year="2006"]').click()
    }
  }

  // Private methods

  _yearToggle(e) {
    let badges
    const target = $(e.delegateTarget)
    $('#datasheet-toggles button').removeClass('active')
    target.addClass('active')
    this.year = $(e.delegateTarget).attr('data-year')
    if (this.year === '2015') {
      this.years = [2015]
      badges = {
        years: this.years,
        last: false
      }
    } else if (this.year === '2017') {
      this.years = [2017]
      badges = {
        years: this.years,
        last: false
      }
    } else {
      this.years = [2006, 2008, 2010, 2012]
      badges = {
        years: this.years,
        last: false
      }
    }
    $('#profile-mode').empty().append($(template_profile_badges(badges)))
    if (this.year === '2006' && this.alpha2 === 'HU') {
      this.data = {
        alpha2: 'HU',
        name: 'Hungary'
      }
    } else {
      this.data = this.lookup(this.alpha2)
    }
    let collapsed = false
    if ($('#accordion2 .accordion-body').hasClass('in')) {
      collapsed = true
    }
    reportGenerator.update(this.year, collapsed)
  }

  _repaint(dataset = reportGenerator.dataset,
           questionSet = reportGenerator.questionSet) {
    let score
    let percentageData
    if (this.year === '2015') {
      percentageData = {
        percentages: [
          this._getPercentages(this.data.alpha2, this.data.db_2015, '2015', questionSet)
        ]
      }
    } else if (this.year === '2017') {
      percentageData = {
        percentages: [
          this._getPercentages(this.data.alpha2, this.data.db_2017, '2017', questionSet)
        ]
      }
    } else {
      percentageData = {
        percentages: [
          this._getPercentages(this.data.alpha2, this.data.db_2006, '2006', questionSet),
          this._getPercentages(this.data.alpha2, this.data.db_2008, '2008', questionSet),
          this._getPercentages(this.data.alpha2, this.data.db_2010, '2010', questionSet),
          this._getPercentages(this.data.alpha2, this.data.db_2012, '2012', questionSet)
        ]
      }
    }
    $('.percentages').empty().append($(template_profile_percentages(percentageData)))
    $('.percentbar').tooltip({
      placement: 'right',
      delay: 50,
      animation: true
    })
    const detailsData = this._getDetails(this.data, questionSet)
    $('.past').show()
    $('.future').hide()
    $('.details').html(template_profile_details(detailsData))
    // Add question number hover effect
    this.$el.find('tr.question-row').mouseover(this._onHoverQuestion)
    this.$el.find('tr.question-row:first').mouseover()
    // Fill out scores
    const renderScore = function (year, scoreToRender) {
      if (scoreToRender !== undefined) {
        $('.scores .year-' + year).css('opacity', '1.0')
        $('.scores .year-' + year + ' .bottom').text('Score: ' + scoreToRender)
      } else {
        $('.scores .year-' + year).css('opacity', '0.2')
        return $('.scores .year-' + year + ' .bottom').text('-')
      }
    }
    if (this.year === '2015') {
      renderScore(2015, percentageData.percentages[0].score)
    } else if (this.year === '2017') {
      renderScore(2017, percentageData.percentages[0].score)
    } else {
      renderScore(2006, percentageData.percentages[0].score)
      renderScore(2008, percentageData.percentages[1].score)
      renderScore(2010, percentageData.percentages[2].score)
      renderScore(2012, percentageData.percentages[3].score)
    }
  }

  _ibpWebsiteUrl(alpha2) {
    // Special cases: Links are inconsistent on the core website
    if (alpha2 === 'BJ') {
      alpha2 = 'benin'
    }
    // Quatar Tunisia and Myanmar have no page
    if (alpha2 === 'QA' || alpha2 === 'TN' || alpha2 === 'MM') {
      return ''
    }
    return 'http://internationalbudget.org/what-we-do/open-budget-survey/country-info/?country=' +
           alpha2.toLowerCase()
  }

  _onHoverQuestion(e) {
    const target = $(e.delegateTarget)
    let datasetQuestion
    if ($('#datasheet-toggles button.active').attr('data-year') === '2015') {
      datasetQuestion = _EXPLORER_DATASET.question_2015
    } else if ($('#datasheet-toggles button.active').attr('data-year') === '2017') {
      datasetQuestion = _EXPLORER_DATASET.question_2017
    } else {
      datasetQuestion = _EXPLORER_DATASET.question_old
    }
    const number = target.attr('data-question-number')
    const t3q = {
      // t3 questions for 2015
      t3pbs: '134',
      t3ebp: '135',
      t3eb: '136',
      t3iyr: '137',
      t3myr: '138',
      t3yer: '139',
      t3ar: '140',

      // t3 questions for 2017
      'PBS-2': 143,
      'EBP-2': 144,
      'EB-2': 145,
      'IYR-2': 146,
      'MYR-2': 147,
      'YER-2': 148,
      'AR-2': 149
    }
    let nb
    let q
    if (_.has(t3q, number)) {
      nb = t3q[number]
      q = datasetQuestion[nb]
    } else {
      q = datasetQuestion[number]
    }
    const qbox = $('.question-box')
    qbox.html(template_question_text(q))
    const top = target.position().top - 21
    const maxTop = $('.details').height() - qbox.height() - 21
    qbox.css({
      left: $('.details table').width(),
      top: Math.max(0, Math.min(top, maxTop))
    })
    $('tr.question-row').removeClass('hover')
    target.addClass('hover')
  }

  _onNavChange(e) {
    const value = $(e.delegateTarget).val()
    if (value.length === 0) {
      window.location = '#profile'
    } else {
      assert(value.length === 2, 'Invalid country code: ' + value)
      window.location = '#profile/' + value
    }
  }

  _numberToLetter(dataset, questionNumber) {
    /*
    The given letters in the source data aren't always there. 'q102l' does not
    exist while 'q102' does. Therefore it is safer to use this technique to
    extract a letter...
    */
    if (dataset === undefined) {
      return ''
    }
    let value
    if (_.has(dataset, questionNumber)) {
      value = dataset[questionNumber]
      assert(value === (-1) || value === 0 || value === 33 || value === 67 ||
             value === 100, 'Invalid value: ' + value)
    } else {
      value = '-1'
    }
    return {
      '-1': 'e',
      0: 'd',
      33: 'c',
      67: 'b',
      100: 'a'
    }[value]
  }

  _getPercentages(alpha2, data, year, questionSet) {
    if (data === undefined) {
      return {
        year: year,
        not_defined: true
      }
    }
    const out = {
      total: questionSet.length,
      year: year,
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0
    }

    out.score = reportGenerator.calculateScore(data, questionSet)
    if (out.score < 0) {
      out.score = 'N/A'
    } else {
      out.score = Math.round(out.score)
    }

    _.forEach(questionSet, i => {
      const letter = this._numberToLetter(data, i)
      assert(
        letter === 'a' || letter === 'b' || letter === 'c' || letter === 'd' ||
        letter === 'e')
      out[letter]++
    })
    assert(out.a + out.b + out.c + out.d + out.e === out.total,
           'Integrity problem in profile calculation')
    // Calculate bar widths. They are superimposed on top of each other, in
    // decreasing width.
    out.a_width = out.a * 100 / out.total
    out.b_width = (out.a + out.b) * 100 / out.total
    out.c_width = (out.a + out.b + out.c) * 100 / out.total
    out.d_width = (out.a + out.b + out.c + out.d) * 100 / out.total
    out.e_width = 100
    return out
  }

  _getDetails(data, questionSet) {
    const out = {
      questions: [],
      years: this.years
    }
    if (this.years[0] === 2015) {
      out.last = true
    } else {
      out.last = false
    }
    _.forEach(questionSet, x => {
      const obj = {
        number: x
      }
      _.forEach(this.years, y => {
        const yearKey = y
        const dbKey = 'db_' + y
        obj[yearKey] = this._numberToLetter(data[dbKey], x)
      })
      out.questions.push(obj)
    })
    return out
  }
}

export default ProfilePage
