import _ from 'underscore'
import Backbone from 'backbone'

import template from './templates/reportgenerator.hbs'
const debug = false

class ReportGenerator extends Backbone.View {

  initialize() {
    if (debug) {
      this.debugReports()
    }
    this.region = [0] // Initially our custom 'Entire World' collection
    this.year = '2015'
    this._download = _.bind(this._download, this)
    this._csvAnswers = _.bind(this._csvAnswers, this)
    this._number_to_letter = _.bind(this._number_to_letter, this)
    this._writeLine = _.bind(this._writeLine, this)
    this._clickBoxToggle = _.bind(this._clickBoxToggle, this)
    this._clickRegionToggle = _.bind(this._clickRegionToggle, this)
    this._clickGroupToggle = _.bind(this._clickGroupToggle, this)
    this._setSubtitle = _.bind(this._setSubtitle, this)
    this._expand_collapse = _.bind(this._expand_collapse, this)
    this._select_or_clear = _.bind(this._select_or_clear, this)
    this._updated = _.bind(this._updated, this)
    this.update = _.bind(this.update, this)
    this.calculateScore = _.bind(this.calculateScore, this)
    this.render = _.bind(this.render, this)
    this.setInitialState = _.bind(this.setInitialState, this)
    this.debugReports = _.bind(this.debugReports, this)
    this.initialize = _.bind(this.initialize, this)
  }

  debugReports() {
    const obi_questions = _EXPLORER_DATASET.groupings[0].entries[0].qs
    _.forEach(_EXPLORER_DATASET.country, (country) => {
      _.forEach(['db_2006', 'db_2008', 'db_2010', 'db_2012', 'db_2015'], (year) => {
        if (_.has(country, year)) {
          let score = this.calculateScore(country[year], obi_questions)
          expected = country[year].obi
          if (!Math.round(expected * 100) == Math.round(score * 100)) {
            console.warn('Warning ' + country.name + '.' + year + ' failed')
          }
        }
      })
    })
    console.log('[debug] Data integrity check complete.')
  }


  // Public methods
  setInitialState() {
    this.$el.find('#group-0').click()
  }

  render(target) {
    let renderData
    if (this.year != '2015') {
      renderData = {
        groupings0: _EXPLORER_DATASET.groupings_old.slice(0, 1),
        groupings1: _EXPLORER_DATASET.groupings_old.slice(1, 3),
        groupings2: _EXPLORER_DATASET.groupings_old.slice(3, 5),
        question: _.map(_EXPLORER_DATASET.question_old, (q) => {
          return q
        }),
        country: _EXPLORER_DATASET.country_old,
        regions: _EXPLORER_DATASET.regions_old
      }
      this.years = [2006, 2008, 2010, 2012]
    } else {
      renderData = {
        groupings0: _EXPLORER_DATASET.groupings.slice(0, 1),
        groupings1: _EXPLORER_DATASET.groupings.slice(1, 2),
        groupings2: _EXPLORER_DATASET.groupings.slice(2, 3),
        question: _.map(_EXPLORER_DATASET.question, (q) => {
          return q
        }),
        country: _EXPLORER_DATASET.country,
        regions: _EXPLORER_DATASET.regions
      }
      this.years = [2006, 2008, 2010, 2012, 2015]
    }
    // Write to DOM
    this.$el.html(template(renderData))
    target.empty().append(this.$el)

    this.$el.find('.group-toggler').bind('mouseover', this._hoverGroupToggle)
    this.$el.find('.group-toggler').bind('click', this._clickGroupToggle)
    this.$el.find('.region-toggler').bind('click', this._clickRegionToggle)
    this.$el.find('.group-toggler').bind('mouseout', (e) => {
      this.$el.find('.toggle-box').removeClass('hover')
    })
    this.$el.find('.toggle-box').bind('click', this._clickBoxToggle)
    this.$el.find('.nav a').bind('click', this._expand_collapse)
    this.$el.find('.select-or-clear button').bind('click', this._select_or_clear);
    this.$el.find('.download-csv').bind('click', this._download)
    this.$el.find('.toggle-box').tooltip({
      placement: 'left',
      delay: 100,
      animation: true
    })
    _.forEach(this.region, (reg) => {
      this.$el.find('#region-' + reg).addClass('active')
    })
    // Bind to the accordion
    this.$el.find('#accordion2').on('show', () => {
      this.trigger('resizeStart')
      $('.customize-link').html('&laquo; Hide options')
    })
    this.$el.find('#accordion2').on('hide', () => {
      this.trigger('resizeStart')
      $('.customize-link').html('Customize Report &raquo;')
    })
  }

  calculateScore(db, questionSet, verbose = false) {
    if (questionSet.length === 0) return 0
    let acc = 0
    let count = 0
    _.forEach(questionSet, (x) => {
      if (db[x] >= 0) {
        acc += db[x]
        count++
      }
    })
    if (count === 0) return -1
    if (verbose) {
      console.log('result', acc, count, (acc / count),
                  Math.round(acc / count), questionSet)
    }
    return acc / count
  }

  update(selectedYear, collapsed, entireWorld = false) {
    this.year = selectedYear
    let renderData
    if (this.year != '2015') {
      renderData = {
        groupings0: _EXPLORER_DATASET.groupings_old.slice(0, 1),
        groupings1: _EXPLORER_DATASET.groupings_old.slice(1, 3),
        groupings2: _EXPLORER_DATASET.groupings_old.slice(3, 5),
        question: _.map(_EXPLORER_DATASET.question_old, (q) => {
          return q
        }),
        country: _EXPLORER_DATASET.country_old,
        regions: _EXPLORER_DATASET.regions_old
      }
      this.years = [2006, 2008, 2010, 2012]
    } else {
      renderData = {
        groupings0: _EXPLORER_DATASET.groupings.slice(0, 1),
        groupings1: _EXPLORER_DATASET.groupings.slice(1, 2),
        groupings2: _EXPLORER_DATASET.groupings.slice(2, 3),
        question: _.map(_EXPLORER_DATASET.question, (q) => {
          return q
        }),
        country: _EXPLORER_DATASET.country,
        regions: _EXPLORER_DATASET.regions
      }
      this.years = [2006, 2008, 2010, 2012, 2015]
    }
    // Write to DOM
    this.$el.html(template(renderData))

    this.$el.find('.group-toggler').bind('mouseover', this._hoverGroupToggle)
    this.$el.find('.group-toggler').bind('click', this._clickGroupToggle)
    this.$el.find('.region-toggler').bind('click', this._clickRegionToggle)
    this.$el.find('.group-toggler').bind('mouseout', (e) => {
      this.$el.find('.toggle-box').removeClass('hover')
    })
    this.$el.find('.toggle-box').bind('click', this._clickBoxToggle)
    //@$el.find('.toggle-box').bind('mouseover', this._showQuestion)
    //@$el.find('.toggle-box').bind('mouseout', this._hideQuestion)
    this.$el.find('.nav a').bind('click', this._expand_collapse)
    this.$el.find('.select-or-clear button').bind('click', this._select_or_clear)
    this.$el.find('.download-csv').bind('click', this._download)
    this.$el.find('.toggle-box').tooltip({
      placement: 'left',
      delay: 100,
      animation: true
    })
    if (entireWorld) {
      this.$el.find('#region-0').click()
    } else {
      _.forEach(this.region, (reg) => {
        this.$el.find('#region-' + reg).addClass('active')
      })
    }
    // Bind to the accordion
    this.$el.find('#accordion2').on('show', () => {
      this.trigger('resizeStart')
      $('.customize-link').html('&laquo; Hide options')
    })
    this.$el.find('#accordion2').on('hide', () => {
      this.trigger('resizeStart')
      $('.customize-link').html('Customize Report &raquo;')
    })
    this.$el.find('#group-0').click()
    if (collapsed) {
      $('#collapseOne').addClass('in')
      $('#accordion2 .accordion-toggle').addClass('collapsed')
      $('.customize-link').html('&laquo; Hide options')
    }
  }

  // Private methods
  _updated() {
    this.questionSet = []
    const el = $('.toggle-box.select') || []
    _.forEach(el, (e) => {
      this.questionSet.push($(e).attr('id').substr(7))
    })
    // Inner function
    // Calculate dataset of contries and scores
    this.dataset_unrounded = []
    let countries
    if (this.year != '2015') {
      countries = _EXPLORER_DATASET.country_old
    } else {
      countries = _EXPLORER_DATASET.country
    }
    let obj
    _.forEach(countries, (country) => {
      obj = {
        country: country.name,
        alpha2: country.alpha2
      }
      _.forEach(this.years, (year) => {
        if (!(_.has(country, 'db_' + year))) {
          return
        }
        let score = this.calculateScore(country['db_' + year], this.questionSet)
        obj[year] = score
      })
      this.dataset_unrounded.push(obj)
    })
    this.dataset = []
    _.forEach(this.dataset_unrounded, (x) => {
      obj = $.extend({}, x)
      _.forEach(this.years, (year) => {
        if (!_.has(obj, year)) {
          return
        }
        obj[year] = Math.round(obj[year])
      })
      this.dataset.push(obj)
    })
    this.trigger('update', this.dataset, this.questionSet, this.region, this.dataset_unrounded)
  }

  _select_or_clear(e) {
    this._setSubtitle()
    this.$el.find('.group-toggler').removeClass('active')
    const el = $(e.delegateTarget)
    if (el.hasClass('select')) {
      $('.toggle-box').addClass('select')
    } else if (el.hasClass('clear')) {
      $('.toggle-box').removeClass('select')
    }
    this._updated()
  }

  _expand_collapse(e) {
    e.preventDefault()
    const inner = this.$el.find('.inner')
    const li = ($(e.delegateTarget)).parents('li')
    this.$el.find('.nav li').removeClass('active')
    li.addClass('active')
    if (li.hasClass('more-options')) {
      this.trigger('resizeStart')
      inner.find('> .more').show(200)
      inner.find('> .less').hide(200)
    } else if (li.hasClass('less-options')) {
      this.trigger('resizeStart')
      this.$el.find('.inner .group-toggler:first').click()
      this.$el.find('.inner .region-toggler:first').click()
      inner.find('> .more').hide(200)
      inner.find('> .less').show(200)
    }
    return false
  }

  _setSubtitle(title = 'Custom Report') {
    this.$el.find('.subtitle').html(title)
  }

  _hoverGroupToggle(e) {
    const el = $(e.delegateTarget)
    const group = el.attr('id')
    $('#toggle-boxes .' + group).addClass('hover')
  }

  _clickGroupToggle(e) {
    e.preventDefault()
    const el = $(e.delegateTarget)
    const group = el.attr('id')
    const x = this.$el.find('#toggle-boxes')
    let activeUl
    if (!this.$el.find('.group-toggler').hasClass('active')) {
      x.find('.toggle-box').removeClass('select')
    } else {
      activeUl = this.$el.find('.group-toggler.active').parents('ul:first')
    }
    if (el.hasClass('active')) {
      el.removeClass('active')
      x.find(' .' + group).removeClass('select')
    } else {
      if (activeUl && !activeUl.is(el.parents('ul:first'))) {
        activeUl.find('.group-toggler.active').each(function() {
          let gp = $(this).attr('id')
          x.find(' .' + gp).removeClass('select')
          $(this).removeClass('active')
        })
      }
      el.addClass('active')
      x.find(' .' + group).addClass('select')
    }
    let selected = this.$el.find('.group-toggler.active')
    if (selected.length === 1) {
      this._setSubtitle(selected.text())
    } else {
      this._setSubtitle()
    }
    this._updated()
    return false
  }

  _clickRegionToggle(e) {
    e.preventDefault()
    let el = $(e.delegateTarget)
    let selected = parseInt(el.attr('id').replace('region-', ''))
    if (selected === 0) {
      this.region = [0]
      this.$el.find('.region-toggler').removeClass('active')
      el.addClass('active')
    } else {
      if (el.hasClass('active')) {
        el.removeClass('active')
        const index = _.indexOf(this.region, selected)
        if (index >= 0) {
          this.region.splice(index, 1)
        }
        if (this.region.length === 0) {
          this.region.push(0)
          this.$el.find('#region-0').addClass('active')
        }
      } else {
        if (this.$el.find('#region-0').hasClass('active')) {
          this.$el.find('#region-0').removeClass('active')
          const index = _.indexOf(this.region, 0)
          if (index >= 0) {
            this.region.splice(index, 1)
          }
        }
        this.region.push(selected)
        el.addClass('active')
      }
    }
    this._updated()
    return false
  }

  _clickBoxToggle(e) {
    e.preventDefault()
    const el = $(e.delegateTarget)
    if (el.hasClass('select')) {
      el.removeClass('select')
    } else {
      el.addClass('select')
    }
    this._setSubtitle()
    this.$el.find('.group-toggler').removeClass('active')
    this._updated()
    return false
  }

  _writeLine(out, x) {
    // Simple CSV escaping which rejects strings containing "
    _.forEach(x, (obj, index) => {
      let element = obj || ''
      assert(!(_.contains(element, '"')), 'Cannot encode string: ' + element)
      if (_.contains(element, ',')) {
        x[index] = '"' + element + '"'
      }
    })
    out.push(x.join(','))
  }

  //TODO: refactor name
  _number_to_letter(value) {
    /*The given letters in the source data arent always there.
     'q102l' does not exist while 'q102' does.
     Therefore it is safer to use this technique to extract a letter...*/
    assert(value === (-1) || value === 0 || value === 33 || value === 67 || value === 100, 'Invalid value: ' + value)
    return {
      '-1': 'e',
      0: 'd',
      33: 'c',
      67: 'b',
      100: 'a'
    }[value]
  }

  _csvAnswers(dataset, region, questionSet) {
    let datasetRegions
    let datasetCountry
    let all_years
    if (this.year != '2015') {
      datasetRegions = _EXPLORER_DATASET.regions_old
      datasetCountry = _EXPLORER_DATASET.country_old
      all_years = ['2006', '2008', '2010', '2012']
    } else {
      datasetRegions = _EXPLORER_DATASET.regions
      datasetCountry = _EXPLORER_DATASET.country
      all_years = ['2015']
    }
    let out = []
    const headers = ['COUNTRY', 'COUNTRY_NAME', 'YEAR', 'SCORE']
    _.forEach(questionSet, (x) => {
      headers.push(x.toString())
    })
    _.forEach(questionSet, (x) => {
      headers.push(x + 'l')
    })
    this._writeLine(out, headers)
    // Quickly lookup country data
    let tmp = {}
    _.forEach(datasetCountry, (x) => {
      tmp[x.alpha2] = x
    })
    let selected_countries = []
    _.forEach(region, (reg) => {
      _.forEach(reg.contains, (contained) => {
        selected_countries.push(contained)
      })
    })
    _.forEach(dataset, (country) => {
      // Maybe has?
      if (!_.contains(selected_countries, country.alpha2)) return
      let selected_year = $('.year-selector button.active').attr('data-year') || $('input[name="downloadyear"]:checked').val()
      if ($('#datasheet-toggles button.active').attr('data-year') == '2006') {
        selected_year = 'all'
      }
      if (!_.contains(all_years, selected_year)) {
        selected_year = all_years
      } else {
        selected_year = [selected_year]
      }
      _.forEach(selected_year, (year) => {
        if (!_.contains(country, year)) return
        let row = [country.alpha2, country.country, year, country[year]]
        _.forEach(questionSet, (q) => {
          row.push(tmp[country.alpha2]['db_'+year][q])
        })
        _.forEach((questionSet, (q) => {
          let value = tmp[country.alpha2]['db_'+year][q]
          row.push(this._number_to_letter(value))
        }))
        assert(row.length == headers.length)
        this._writeLine(out, row)
      })
    })
    return out
  }

  _download(e) {
    const csv = (this._csvAnswers(this.dataset, this.region, this.questionSet)).join('\n')
    const csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv)
    $('.download-csv').attr({
      'download': 'custom-budget-report.csv',
      'href': csvData,
      'target': '_blank'
    })
  }
}


export default new ReportGenerator()