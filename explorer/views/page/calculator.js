import _ from 'underscore'

import template_page from '../templates/page/calculator.hbs'
import template_profile_percentages from '../templates/profile_percentages.hbs'
import template_profile_details from '../templates/profile_details.hbs'
import template_calculator_details_future from '../templates/calculator_details_future.hbs'
import template_calculator_details_future_print from '../templates/calculator_details_future_print.hbs'
import template_calculator_details_future_print_table from '../templates/calculator_details_future_print_table.hbs'
import template_question_text from '../templates/question_text.hbs'
import template_calculator_badges from '../templates/calculator_badges.hbs'

import reportGenerator from '../reportgenerator.js'


class CalculatorPage extends Backbone.View {

  initialize(alpha2, params) {
    this._animationHackScale = _.bind(this._animationHackScale, this)
    this._repaintFutureScore = _.bind(this._repaintFutureScore, this)
    this._onClickAnswer = _.bind(this._onClickAnswer, this)
    this._repaint = _.bind(this._repaint, this)
    this._setupYears = _.bind(this._setupYears, this)
    this._onClickPrint = _.bind(this._onClickPrint, this)
    this._onClickReset = _.bind(this._onClickReset, this)
    this._clickCalculatorGroupToggle = _.bind(this._clickCalculatorGroupToggle, this)
    this.renderPage = _.bind(this.renderPage, this)
    this.initialize = _.bind(this.initialize, this)
    this.alpha2 = alpha2 || ''
    this.year = '2017'
    this.years = [2017]
    this.countries = _EXPLORER_DATASET.country_2017
    this.data = this.lookup(this.alpha2)
    this.params = this._decodeParams(params)
    this.db_2019 = $.extend({}, this.data[`db_${this.year}`], this.params)
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
    return _.find(this.countries, x => x.alpha2 === alpha2) || {}
  }

  renderPage(target) {
    $(window).scrollTop(0)
    const renderData = {
      alpha2: this.alpha2,
      countries: this.countries,
      data: this.data,
      empty: this.alpha2 === '',
      main_website_url: this._ibpWebsiteUrl(this.alpha2),
      years: this.years
    }
    this.$el.html(template_page(renderData))
    target.html(this.$el)
    // Set up nav
    const nav = this.$el.find('.country-nav-select')
    nav.chosen()
    nav.val(this.alpha2).trigger('chosen:updated')
    nav.bind('change', this._onNavChange)
    this._setupYears()
  }

  // Private methods

  _setupYears() {
    const badges = {
      years: this.years,
      groupings0: _EXPLORER_DATASET.groupings_2017.slice(0, 1)
    }
    $('#profile-mode').empty().append($(template_calculator_badges(badges)))
    this.data = this.lookup(this.alpha2)
    let collapsed = false
    if ($('#accordion2 .accordion-body').hasClass('in')) {
      collapsed = true
    }
    reportGenerator.update(this.year, collapsed)

    $('#profile-reset').click(this._onClickReset)
    $('#print-answered').click(this._onClickPrint)
    $('#print-table').click(this._onClickPrint)
    $('.explanation').show()
    $('.calculator-group-toggler').click(this._clickCalculatorGroupToggle)
  }

  _repaint(dataset = reportGenerator.dataset,
           questionSet = reportGenerator.questionSet) {
    let score
    const percentageData = {
      percentages: [
        this._getPercentages(this.data.alpha2, this.data.db_2017, '2017', questionSet)
      ]
    }
    $('.percentages').empty().append($(template_profile_percentages(percentageData)))
    $('.percentbar').tooltip({
      placement: 'right',
      delay: 50,
      animation: true
    })
    const detailsData = this._getDetails(this.data, questionSet)
    $('.future').show()
    $('.details').html(template_calculator_details_future(detailsData))
    $('.letter.multi img').bind('click', this._onClickAnswer)
    _.forEach($('.question-row'), (x) => {
      x = $(x)
      const qnum = x.attr('data-question-number')
      score = this.db_2019[qnum]
      x.find('img[data-score="' + score + '"]').removeClass('inactive')
        .addClass('active')
    })
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
    renderScore(this.year, percentageData.percentages[0].score)
    this._repaintFutureScore()
  }

  _clickCalculatorGroupToggle(e) {
    e.preventDefault()

    const el = $(e.delegateTarget)
    const groupId = el.attr('data-group-id')
    const reportGeneratorGroupBtn = $(`#group-${groupId}`)

    $('.group-toggler').removeClass('active')

    reportGeneratorGroupBtn.click()
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
    const datasetQuestion = _EXPLORER_DATASET.question_2017
    const number = target.attr('data-question-number')
    const t3q = {
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
      window.location = '#calculator'
    } else {
      assert(value.length === 2, 'Invalid country code: ' + value)
      window.location = '#calculator/' + value
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

  _onClickAnswer(e) {
    const el = $(e.delegateTarget)
    const tr = el.parents('tr:first')
    const qnum = tr.attr('data-question-number')
    const score = el.attr('data-score')
    tr.find('img').removeClass('active').addClass('inactive')
    el.removeClass('inactive').addClass('active')
    this.db_2019[qnum] = parseInt(score)
    this.params = _.extend(this.params, { [qnum]: score })
    this._repaintFutureScore()
    this._animationHackScale($('.year-box.year-future'))
    router.navigate(
      `#calculator/${this.alpha2}?${this._encodeParams(this.params)}`)
  }

  _onClickReset(e) {
    /*
    Resets the future results calculator back to displaying current results.
    */
    e.preventDefault()
    this.params = {}
    this.db_2019 = $.extend({}, this.data.db_2017, this.params)
    router.navigate(
      `#calculator/${this.alpha2}?${this._encodeParams(this.params)}`)
    this._repaint()
  }

  _onClickPrint(e, questionSet = reportGenerator.questionSet) {
    e.preventDefault()
    const target = e.delegateTarget
    const printHeader = printHeader || $('#country-header').text()
    const detailsData = this._getDetails(this.data, questionSet)
    const datasetQuestion = _EXPLORER_DATASET.question_2017
    _.map(detailsData.questions, (val, key) => {
      const question = _.find(datasetQuestion, (question) => {
        return String(question['number']) === val['number']
      })
      return val['question'] = question
    })
    if (target.id === 'print-answered') {
      $('.details').html(template_calculator_details_future_print({data: detailsData, year: 2019}))
      if (window.location.toString().split('?')[1]) {
        $('#country-header').text(`${printHeader}: MODIFIED ${this.year} RESULTS`)
      } else {
        $('#country-header').text(printHeader + ': ACTUAL RESULTS')
      }
      _.forEach($('.question-row-print'), (x) => {
        x = $(x)
        const qnum = x.attr('data-question-number')
        const score = this.db_2019[qnum]
        let previousAnswer = this._numberToLetter(this.data.db_2015, qnum)
        if (previousAnswer) {
          previousAnswer = previousAnswer.toUpperCase()
          x.find('.previous-year').html(`Answer was ${previousAnswer} in 2015`)
        }
        x.find('div[data-score="' + score + '"]').addClass('active-print')
      })
    }
    if (target.id === 'print-table') {
      const score2019 = reportGenerator.calculateScore(this.db_2019,
                                                 reportGenerator.questionSet)
      const score2017 = reportGenerator.calculateScore(this.data.db_2017,
                                                  reportGenerator.questionSet)
      _.forEach(detailsData.questions, (question) => {
        question['l2017'] = this._numberToLetter(this.db_2019,
                                                   question['number'])
      })
      $('.details').html(template_calculator_details_future_print_table({
        data: detailsData,
        score2019: Math.round(score2019),
        score2017: Math.round(score2017),
        year: 2019 }))
    }
    _.forEach($('.question-row'), (x) => {
      x = $(x)
      const qnum = x.attr('data-question-number')
      const score = this.db_2019[qnum]
      x.find('img[data-score="' + score + '"]').removeClass('inactive')
        .addClass('active')
    })
    window.print()
    $('#country-header').text(printHeader)
    this._repaint()
  }

  _repaintFutureScore() {
    /*
    Update the future score for the calculator.
    */
    let score = reportGenerator.calculateScore(this.db_2019,
                                               reportGenerator.questionSet)
    score = Math.round(score)
    $('.scores .year-future .bottom').text('Score: ' + score)
  }

  _animationHackScale(element, scale = 1.3, time = 340) {
    /*
    Hacky function to make an element pulse to a new scale and back again.
    Follows a SIN wave. Looks like a heartbeat. Overwrites the font-size
    property. Hence hacky.
    */
    element = $(element)
    element.css('font-size', 100)
    element.animate({
      'font-size': 0
    }, {
      duration: time,
      easing: 'linear',
      step: function (now, fx) {
        let _scale
        let x
        x = (now * Math.PI) / 100;
        x = 1 + (Math.sin(x) * (scale - 1))
        _scale = 'scale(' + x + ',' + x + ')'
        return element.css({
          '-moz-transform': _scale,
          '-o-transform': _scale,
          '-ms-transform': _scale,
          '-webkit-transform': _scale,
          'transform': _scale
        })
      }
    })
  }
}

export default CalculatorPage
