'use strict'

import { View } from 'backbone'
import _ from 'underscore'
import $ from 'jquery'

import template_page from '../templates/page/participation.hbs'
import template_row from '../templates/participation_row.hbs'
import template_comments from '../templates/participation_comments.hbs'

import * as util from '../../util.js'

class ProjectPage extends View {

  initialize() {
    this.sortBy = 'name'
    this.participation = _EXPLORER_DATASET.public_participation;
    this._onRegChange = _.bind(this._onRegChange, this);
    this._onNavChange = _.bind(this._onNavChange, this);
    this._onClickQuestion = _.bind(this._onClickQuestion, this);
    this._completeAnswer = _.bind(this._completeAnswer, this);
    this._boxHeight = _.bind(this._boxHeight, this);
    this._reflow = _.bind(this._reflow, this);
    this._sorted = _.bind(this._sorted, this);
    this._sortByColumn = _.bind(this._sortByColumn, this);
    this._getCountry = _.bind(this._getCountry, this);
    this._calculateScore = _.bind(this._calculateScore, this);
    this._getQuestions = _.bind(this._getQuestions, this);
    this.renderPage = _.bind(this.renderPage, this);
    this.initialize = _.bind(this.initialize, this);
  }

  renderPage(target) {
    $(window).scrollTop(0)
    this.region = '0'
    this.countriesIncluded = []
    _.forEach(_EXPLORER_DATASET.regions_2015[parseInt(this.region)].contains, (contained) => {
      this.countriesIncluded.push(contained);
    })
    this.renderData = {
      questions: this._getQuestions(),
      countries: this._getCountry()
    }
    this.$el.html(template_page(this.renderData))
    target.html(this.$el)
    $('th.col2').tooltip({
      delay: 50,
      animation: true
    })
    this._reflow()
    $('.sortbyname').click(this._sortByColumn)
    $('.sortbyname[data-sort="' + this.sortBy + '"]').click()
    let nav = this.$el.find('#select-country')
    nav.chosen()
    nav.val(this.alpha2).trigger('chosen:updated')
    nav.bind('change', this._onNavChange)
    let navReg = this.$el.find('#select-region')
    navReg.chosen()
    navReg.val('').trigger('chosen:updated')
    navReg.bind('change', this._onRegChange)
  }

  _getQuestions() {
    let questions = []
    let allQ = [114]
    _.forEach(_.range(119, 134), (n) => {
      allQ.push(n)
    })
    _.forEach(allQ, (q) => {
      let data = _EXPLORER_DATASET.question_2015[q + '']
      questions.push(data)
    })
    return questions
  }

  _calculateScore(country) {
    let acc = 0
    let count = 0
    _.forEach(country['question'], (x) => {
      if (parseFloat(x['score']) >= 0) {
        acc += parseFloat(x['score'])
        count++
      }
    })
    if (count === 0) {
      return -1
    }
    return Math.round(acc / count)
  }

  _getCountry() {
    let countries = []
    let allQ = [114]
    _.forEach(_.range(119, 134), (n) => {
      allQ.push(n)
    })
    let data, obj
    _.forEach(this.participation, (ctry) => {
      if (_.contains(this.countriesIncluded, ctry.alpha2)){
        data = {
          alpha2: ctry.alpha2,
          country: ctry.name,
          question: []
        }
        _.forEach(allQ, (q) => {
          obj = {
            number: q + '',
            score: ctry[q + '']['score'],
            letter: ctry[q + '']['letter'],
            comments: ctry[q + '']['comments']
          };
          data.question.push(obj)
        })
        data.score = this._calculateScore(data)
        countries.push(data)
      }
    })
    return countries
  }

  _sortByColumn(e) {
    e.preventDefault()
    const target = $(e.delegateTarget)
    $('.sortbyname').removeClass('active')
    target.addClass('active')
    this.sortBy = target.attr('data-sort')
    this._reflow()
    if (this.sortBy !== 'name' && this.sortBy !== 'score') {
      this.$el.find('td[data-question-number="' + this.sortBy + '"].letter').addClass('selected')
    }
    return false
  }

  _sorted(a, b) {
    let aScore, bScore
    _.forEach(b['question'], (i) => {
      if (i['number'] === this.sortBy) {
        bScore = i['score']
      }
    })
    _.forEach(a['question'], (j) => {
      if (j['number'] === this.sortBy) {
        aScore = j['score'];
      }
    })
    let x = bScore - aScore;
    if (!x) {
      return a.country.localeCompare(b.country)
    }
    return x
  }

  _reflow() {
    let tbody = $('#participation-table tbody')
    tbody.empty()
    let data = this.renderData['countries']
    if (this.sortBy === 'name') {
      data.sort(util.sortFunctionByName)
    } else if (this.sortBy === 'score') {
      data.sort(util.sortFunction)
    } else {
      data.sort(this._sorted)
    }
    tbody.append(template_row(this.renderData))
    $('#participation-table .letter').click(this._onClickQuestion)
  }

  _boxHeight(country) {
    const qtheight = $('.comments-box.' + country + ' .question .question-text').height()
    const ctheight = $('.comments-box.' + country + ' .comments .comments-text').height()
    if (qtheight > ctheight) {
      $('.comments-box.' + country + ' .comments .comments-text').height(qtheight)
    } else {
      $('.comments-box.' + country + ' .question .question-text').height(ctheight)
    }
    const qheight = $('.comments-box.' + country + ' .question').height()
    const cheight = $('.comments-box.' + country + ' .comments').height()
    if (qheight > cheight) {
      $('.comments-box.' + country + ' .comments').height(qheight)
    } else {
      $('.comments-box.' + country + ' .question').height(cheight)
    }
  }

  _completeAnswer(country, number) {
    let q = _EXPLORER_DATASET.question_2015[number]
    const countries = this._getCountry()
    _.forEach(countries, (obj) => {
      if (obj['alpha2'] === country) {
        _.forEach(obj['question'], (elt) => {
          if (elt['number'] === number) {
            q['comments'] = elt['comments']
          }
        })
      }
    })
    return q
  }

  _onClickQuestion(e) {
    let target = $(e.delegateTarget)
    const number = target.attr('data-question-number')
    const country = target.parent('tr').attr('id')
    let cbox = $('.comments-box.' + country)
    if (this.sortBy === number) {
      if (target.hasClass('active')) {
        target.removeClass('active')
        target.addClass('inactive')
        cbox.empty()
      } else {
        target.removeClass('inactive')
        target.addClass('active')
        const q = this._completeAnswer(country, number)
        cbox.append(template_comments(q))
        this._boxHeight(country)
      }
    } else {
      $('.comments-box').empty()
      this.$el.find('td.letter.active').removeClass('active').addClass('inactive')
      $('.sortbyname[data-sort="' + number + '"]').click()
      $('html, body').animate({
        scrollTop: $('#' + country).offset().top
      }, 500);
      target = $('tr[id="' + country + '"] td[data-question-number="' + number + '"]')
      target.removeClass('inactive')
      target.addClass('active')
      const q = this._completeAnswer(country, number)
      cbox = $('.comments-box.' + country)
      cbox.append(template_comments(q))
      this._boxHeight(country)
    }
  }

  _onNavChange(e) {
    const value = $(e.delegateTarget).val()
    if (value.length === 2) {
      $('#' + value).css('background-color', 'rgba(84, 169, 84, 0.2)')
      $('html, body').animate({
        scrollTop: $('#' + value).offset().top
      }, 500);
      $('#' + value).animate({
        backgroundColor: 'rgba(255, 255, 255, 0.2)'
      }, 4000);
      $(e.delegateTarget).val('').trigger('liszt:updated')
    }
  }

  _onRegChange(e) {
    const value = $(e.delegateTarget).val().replace('region-', '')
    this.region = value
    if (!this.region) {
      this.region = '0'
    }
    this.countriesIncluded = []
    _.forEach(_EXPLORER_DATASET.regions_2015[parseInt(this.region)].contains, (contained) => {
      this.countriesIncluded.push(contained)
    })
    this.renderData = {
      questions: this._getQuestions(),
      countries: this._getCountry()
    }
    this.$el.html(template_page(this.renderData))
    $('th.col2').tooltip({
      delay: 50,
      animation: true
    })
    this._reflow()
    $('.sortbyname').click(this._sortByColumn)
    $('.sortbyname[data-sort="' + this.sortBy + '"]').click()
    let nav = this.$el.find('#select-country')
    nav.chosen()
    nav.val(this.alpha2).trigger('chosen:updated')
    nav.bind('change', this._onNavChange)
    let navReg = this.$el.find('#select-region')
    navReg.chosen()
    navReg.val('region-' + this.region).trigger('chosen:updated')
    navReg.bind('change', this._onRegChange)
  }
}

export default ProjectPage
