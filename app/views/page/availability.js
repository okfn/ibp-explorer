import template_page from 'views/templates/page/availability'
import template_row from 'views/templates/availability_row'

import reportGenerator from 'views/reportgenerator.js'

class ProjectPage extends Backbone.View {

  initialize() {
    this.regionId = [0]
    this.clickregion = _.bind(this.clickregion, this);
    this._repaint = _.bind(this._repaint, this);
    this._yearToggle = _.bind(this._yearToggle, this);
    this.renderPage = _.bind(this.renderPage, this);
  }

  renderPage(target) {
    reportGenerator.update('2015', false)
    this.$el.html(template_page())
    target.html(this.$el)
    $('#year-toggles button').click(this._yearToggle)
    $('button[data-year="2015"]').click()
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

  _findScore(dataset, country, year) {
    // TODO: refactor this
    return _.find(dataset, (x) => {
      return (x.alpha2 === country)
    })[year]
    //assert(false, "couldn't find country: " + country)
  }

  _repaint(dataset = reportGenerator.dataset, questionSet = reportGenerator.questionSet, region = reportGenerator.region) {
    let tbody = $('#availability tbody')
    tbody.empty()
    let datasetRegions, datasetAv
    if (this.year != '2015') {
      datasetRegions = _EXPLORER_DATASET.regions_old
      datasetAv = _EXPLORER_DATASET.availability_old
    } else {
      datasetRegions = _EXPLORER_DATASET.regions
      datasetAv = _EXPLORER_DATASET.availability
    }
    let countriesIncluded = []
    _.forEach(this.regionId, (reg) => {
      _.forEach(datasetRegions[reg].contains, (contained) => {
        countriesIncluded.push(contained)
      })
    })
    _.forEach(datasetAv, (row) => {
      const key = 'db_' + this.year
      if (!(_.has(row, key))) return
      if (!(_.contains(countriesIncluded, row[key].alpha2))) return
      let obj = row[key]
      obj.score = this._findScore(dataset, row[key].alpha2, this.year)
      tbody.append(template_row(obj))
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