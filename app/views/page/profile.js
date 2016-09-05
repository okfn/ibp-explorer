'use strict'

import _ from 'underscore'

import template_page from '../templates/page/profile.hbs'
import template_profile_percentages from '../templates/profile_percentages.hbs'
import template_profile_details from '../templates/profile_details.hbs'
import template_profile_details_future from '../templates/profile_details_future.hbs'
import template_profile_details_future_print from '../templates/profile_details_future_print.hbs'
import template_question_text from '../templates/question_text.hbs'
import template_profile_badges from '../templates/profile_badges.hbs'

import reportGenerator from '../reportgenerator.js'

class ProfilePage extends Backbone.View {

  initialize(alpha2, params) {
    this._animationHackScale = _.bind(this._animationHackScale, this)
    this._repaint2014 = _.bind(this._repaint2014, this)
    this._onClickAnswer = _.bind(this._onClickAnswer, this)
    this._onToggleMode = _.bind(this._onToggleMode, this)
    this._repaint = _.bind(this._repaint, this)
    this._yearToggle = _.bind(this._yearToggle, this)
    this._onClickPrint = _.bind(this._onClickPrint, this)
    this.renderPage = _.bind(this.renderPage, this)
    this.initialize = _.bind(this.initialize, this)
    this.alpha2 = alpha2 || ''
    this.year = '2015'
    this.data = this.lookup(this.alpha2)
    this.params = this._decodeParams(params)
    this.db_2017 = $.extend({}, this.data.db_2015, this.params)
    reportGenerator.bind('update', this._repaint)
    this.years = [2015]
  }

  _decodeParams(queryString) {
    let params = {}, tmpObj
    if (queryString) {
      _.each(
        _.map(decodeURI(queryString).split(/&/g), function (el, i) {
          const aux = el.split('=')
          let val
          tmpObj = {}
          if (aux.length >= 1) {
            if (aux.length === 2) {
              if (_.contains(['100', '67', '33', '0', '-1'], aux[1])) {
                val = parseInt(aux[1]);
              } else {
                return
              }
            }
            tmpObj[aux[0]] = val;
          }
          return tmpObj
        }),
        function (tmpObj) {
          if (tmpObj) {
            _.extend(params, tmpObj);
          }
        }
      );
    }
    return params;
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
    "Look up a country object by alpha2 code";
    let datasetCountry
    if (this.year !== '2015') {
      datasetCountry = _EXPLORER_DATASET.country_old;
    } else {
      datasetCountry = _EXPLORER_DATASET.country;
    }
    let found = _.find(datasetCountry, (x) => {
      return x.alpha2 === alpha2
    })
    if (found) {
      return found
    } else if (alpha2 === '') {
      return {}
    }
    assert(false, alpha2 + ' is not a valid country code.');
  }

  renderPage(target) {
    let collapsed = false
    if ($('#accordion2 .accordion-body').hasClass('in')) {
      collapsed = true
    }
    this.year =
      $('#datasheet-toggles button.active').attr('data-year') || '2015'
    reportGenerator.update(this.year, collapsed)
    $(window).scrollTop(0)
    const renderData = {
      alpha2: this.alpha2,
      countries: _EXPLORER_DATASET.country,
      data: this.data,
      empty: this.alpha2 === "",
      main_website_url: this._ibp_website_url(this.alpha2),
      years: this.years
    }
    this.viewPast = true
    this.$el.html(template_page(renderData))
    target.html(this.$el)
    this._repaint()
    // Set up nav
    let nav = this.$el.find('.country-nav-select')
    nav.chosen()
    nav.val(this.alpha2).trigger('chosen:updated')
    nav.bind('change', this._onNavChange);
    $('#datasheet-toggles button').click(this._yearToggle);
    if (this.year === '2015') {
      $('button[data-year="2015"]').click()
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
        last: true
      };
    } else {
      this.years = [2006, 2008, 2010, 2012]
      badges = {
        years: this.years,
        last: false
      }
    }
    $('#profile-mode').empty().append($(template_profile_badges(badges)))
    if (this.year === '2015') {
      $('#profile-toggle').click(this._onToggleMode)
    }
    if (this.year === '2006' && this.alpha2 === 'HU') {
      this.data = {
        alpha2: 'HU',
        name: 'Hungary'
      };
    } else {
      this.data = this.lookup(this.alpha2)
    }
    let collapsed = false;
    if ($('#accordion2 .accordion-body').hasClass('in')) {
      collapsed = true;
    }
    reportGenerator.update(this.year, collapsed)
    this._onToggleMode()
  }

  _repaint(dataset = reportGenerator.dataset,
           questionSet = reportGenerator.questionSet) {
    var render_score, score
    let percentageData
    if (this.year !== '2015') {
      percentageData = {
        percentages: [this._get_percentages(this.data.alpha2, this.data.db_2006,
                                            '2006', questionSet),
                      this._get_percentages(this.data.alpha2, this.data.db_2008,
                                            '2008', questionSet),
                      this._get_percentages(this.data.alpha2, this.data.db_2010,
                                            '2010', questionSet),
                      this._get_percentages(this.data.alpha2, this.data.db_2012,
                                            '2012', questionSet)]
      };
    } else {
      percentageData = {
        percentages: [this._get_percentages(this.data.alpha2, this.data.db_2015,
                                            '2015', questionSet)]
      };
    }
    $('.percentages').empty()
      .append($(template_profile_percentages(percentageData)))
    $('.percentbar').tooltip({
                               placement: 'right',
                               delay: 50,
                               animation: true
                             })
    const detailsData = this._get_details(this.data, questionSet)
    if (this.viewPast) {
      $('.past').show()
      $('.future').hide()
      $('.details').html(template_profile_details(detailsData))
    } else {
      $('.future').show()
      //Prorably not needed
      $('.past').hide()
      $('.details').html(template_profile_details_future(detailsData))
      $('.letter.multi img').bind('click', this._onClickAnswer)
      this._repaint2014
      _.forEach($('.question-row'), (x) => {
        x = $(x)
        const qnum = x.attr('data-question-number')
        score = this.db_2017[qnum]
        x.find('img[data-score="' + score + '"]').removeClass('inactive')
          .addClass('active')
      })
    }
    this._repaint2014()
    // Add question number hover effect
    this.$el.find('tr.question-row').mouseover(this._onHoverQuestion)
    this.$el.find('tr.question-row:first').mouseover()
    // Fill out scores
    render_score = function (year, score) {
      if (!(score === undefined)) {
        $('.scores .year-' + year).css('opacity', '1.0')
        $('.scores .year-' + year + ' .bottom').text('Score: ' + score)
      } else {
        $('.scores .year-' + year).css('opacity', '0.2')
        return $('.scores .year-' + year + ' .bottom').text('-')
      }
    };
    if (this.year !== '2015') {
      render_score(2006, percentageData.percentages[0].score)
      render_score(2008, percentageData.percentages[1].score)
      render_score(2010, percentageData.percentages[2].score)
      render_score(2012, percentageData.percentages[3].score)
    } else {
      render_score(2015, percentageData.percentages[0].score)
    }
    this._repaint2014();
  }

  _ibp_website_url(alpha2) {
    // Special cases: Links are inconsistent on the core website
    if (alpha2 === 'BJ') {
      alpha2 = 'benin';
    }
    // Quatar Tunisia and Myanmar have no page
    if (alpha2 === 'QA' || alpha2 === 'TN' || alpha2 === 'MM') {
      return '';
    }
    return 'http://internationalbudget.org/what-we-do/open-budget-survey/country-info/?country=' +
           alpha2.toLowerCase()
  }

  _onHoverQuestion(e) {
    const target = $(e.delegateTarget);
    let datasetQuestion
    if ($('#datasheet-toggles button.active').attr('data-year') === '2015') {
      datasetQuestion = _EXPLORER_DATASET.question
    } else {
      datasetQuestion = _EXPLORER_DATASET.question_old
    }
    const number = target.attr('data-question-number')
    const t3q = {
      t3pbs: '134',
      t3ebp: '135',
      t3eb: '136',
      t3iyr: '137',
      t3myr: '138',
      t3yer: '139',
      t3ar: '140'
    };
    let nb, q
    if (_.has(t3q, number)) {
      nb = t3q[number];
      q = datasetQuestion[nb];
    } else {
      q = datasetQuestion[number];
    }
    let qbox = $('.question-box')
    qbox.html(template_question_text(q))
    const top = target.position().top - 21
    const max_top = $('.details').height() - qbox.height() - 21
    qbox.css({
               left: $('.details table').width(),
               top: Math.max(0, Math.min(top, max_top))
             })
    $('tr.question-row').removeClass('hover')
    target.addClass('hover')
  }

  _onNavChange(e) {
    const value = $(e.delegateTarget).val();
    if (value.length === 0) {
      window.location = '#profile'
    } else {
      assert(value.length === 2, 'Invalid country code: ' + value)
      window.location = '#profile/' + value
    }
  }

  _number_to_letter(dataset, questionNumber) {
    "The given letters in the source data arent always there. " +
    "'q102l' does not exist while 'q102' does." +
    "Therefore it is safer to use this technique to extract a letter..."
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

  _get_percentages(alpha2, data, year, questionSet) {
    if (data === undefined) {
      return {
        year: year,
        not_defined: true
      }
    }
    let out = {
      total: questionSet.length,
      year: year,
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0
    }
    _.forEach(reportGenerator.dataset, (x) => {
      if (x.alpha2 === alpha2) {
        out.score = x[year];
        if (out.score < 0) {
          out.score = 'N/A';
        }
      }
    })
    _.forEach(questionSet, (i) => {
      const letter = this._number_to_letter(data, i)
      assert(
        letter === 'a' || letter === 'b' || letter === 'c' || letter === 'd' ||
        letter === 'e')
      out[letter]++
    })
    assert(out.a + out.b + out.c + out.d + out.e === out.total,
           "Integrity problem in profile calculation");
    //Calculate bar widths. They are superimposed on top of each other, in
    // decreasing width..
    out.a_width = out.a * 100 / out.total
    out.b_width = (out.a + out.b) * 100 / out.total
    out.c_width = (out.a + out.b + out.c) * 100 / out.total
    out.d_width = (out.a + out.b + out.c + out.d) * 100 / out.total
    out.e_width = 100
    return out
  }

  _get_details(data, questionSet) {
    let out = {
      questions: [],
      years: this.years
    }
    if (this.years[0] === 2015) {
      out.last = true
    } else {
      out.last = false
    }
    _.forEach(questionSet, (x) => {
      let obj = {
        number: x
      }
      _.forEach(this.years, (y) => {
        const year_key = 'l' + y
        const db_key = 'db_' + y
        obj[year_key] = this._number_to_letter(data[db_key], x)
      })
      out.questions.push(obj)
    })
    return out
  }

  _onToggleMode(e) {
    if (!_.isEmpty(this.params) || e) {
      if (e) e.preventDefault()
      if ($('#profile-toggle').hasClass('inactive')) {
        $('#profile-toggle').removeClass('inactive')
        $('#profile-toggle').addClass('active')
        $('#profile-mode').addClass('profile-mode-expanded')
        $('#profile-toggle').html('« Hide 2017 Calculator')
        $('#print-answered').click(this._onClickPrint)
        $('#print-plain').click(this._onClickPrint)
      } else if ($('#profile-toggle').hasClass('active')) {
        $('#profile-toggle').removeClass('active')
        $('#profile-toggle').addClass('inactive')
        $('#profile-mode').removeClass('profile-mode-expanded')
        $('#profile-toggle').html('Show 2017 Calculator »')
      }
    }
    const _viewPast = this.viewPast
    this.viewPast = !$('#profile-toggle').hasClass('active')
    const animate = !(_viewPast === this.viewPast)
    // Populate the DOM
    this._repaint()
    const explanation = $('.explanation');
    if (!this.viewPast) {
      explanation.show();
      if (animate) {
        $('.future').css('opacity', 0).animate({
                                                 'opacity': 1
                                               }, 300);
      }
    } else {
      explanation.hide();
    }
  }

  _onClickAnswer(e) {
    const el = $(e.delegateTarget)
    const tr = el.parents('tr:first')
    const qnum = tr.attr('data-question-number')
    const score = el.attr('data-score')
    tr.find('img').removeClass('active').addClass('inactive')
    el.removeClass('inactive').addClass('active')
    this.db_2017[qnum] = parseInt(score)
    this.params = _.extend(this.params, { [qnum]: score })
    this._repaint2014()
    this._animationHackScale($('.year-box.year-2017'))
    router.navigate(
      `#profile/${this.alpha2}?${this._encodeParams(this.params)}`)
  }

  _onClickPrint(e, questionSet = reportGenerator.questionSet) {
    e.preventDefault()
    const target = e.delegateTarget
    const printHeader = printHeader || $('#print-header').text()
    let detailsData = this._get_details(this.data, questionSet)
    let datasetQuestion
    if ($('#datasheet-toggles button.active').attr('data-year') === '2015') {
      datasetQuestion = _EXPLORER_DATASET.question
    } else {
      datasetQuestion = _EXPLORER_DATASET.question_old
    }
    _.map(detailsData.questions, (val, key) => {
      return val['question'] = datasetQuestion[key + 1]
    })
    if (target.id === 'print-plain') {
      $('.details').html(template_profile_details_future_print({data: detailsData}))
      $('#print-header').text('Survey Questions and Answers')
    }
    if (target.id === 'print-answered') {
      $('.details').html(template_profile_details_future_print({data: detailsData, year: 2017}))
      if (window.location.toString().split('?')[2]) {
        $('#print-header').text(`${printHeader}: MODIFIED ${this.year} RESULTS`)
      } else {
        $('#print-header').text(printHeader + ': ACTUAL RESULTS')
      }
      _.forEach($('.question-row-print'), (x) => {
        x = $(x)
        const qnum = x.attr('data-question-number')
        let score = this.db_2017[qnum]
        x.find('div[data-score="' + score + '"]').addClass('active-print')
      })
    }
    _.forEach($('.question-row'), (x) => {
      x = $(x)
      const qnum = x.attr('data-question-number')
      let score = this.db_2017[qnum]
      x.find('img[data-score="' + score + '"]').removeClass('inactive')
        .addClass('active')
    })
    window.print()
    $('#print-header').text(printHeader)
    this._repaint()
  }

  _repaint2014() {
    let score = reportGenerator.calculateScore(this.db_2017,
                                               reportGenerator.questionSet)
    score = Math.round(score)
    $('.scores .year-2017 .bottom').text('Score: ' + score)
  }

  _animationHackScale(element, scale = 1.3, time = 340) {
    "Hacky function to make an element pulse to a new scale and back again." +
    "Follows a SIN wave. Looks like a heartbeat. Overwrites the font-size property. Hence hacky.";
    element = $(element)
    element.css('font-size', 100);
    element.animate({
                      'font-size': 0
                    }, {
                      duration: time,
                      easing: 'linear',
                      step: function (now, fx) {
                        var _scale, x;
                        x = (now * Math.PI) / 100;
                        x = 1 + (Math.sin(x) * (scale - 1));
                        _scale = 'scale(' + x + ',' + x + ')';
                        return element.css({
                                             '-moz-transform': _scale,
                                             '-o-transform': _scale,
                                             '-ms-transform': _scale,
                                             '-webkit-transform': _scale,
                                             'transform': _scale
                                           });
                      }
                    })
  }
}

export default ProfilePage
