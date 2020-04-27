import _ from 'underscore'
import template_page from '../templates/page/download.hbs'
import template_files from '../templates/download_files.hbs'
import reportGenerator from '../reportgenerator.js'

class DownloadPage extends Backbone.View {

  initialize() {
    this._onNavChange = _.bind(this._onNavChange, this)
    this._repaint = _.bind(this._repaint, this)
    this.changeyear = _.bind(this.changeyear, this)
    this.renderPage = _.bind(this.renderPage, this)
    this.initialize = _.bind(this.initialize, this)
    reportGenerator.bind('update', this._repaint)
  }

  renderPage(target) {
    let collapsed = false
    if ($('#accordion2 .accordion-body').hasClass('in')) {
      collapsed = true
    }
    this.year = _EXPLORER_DATASET.THIS_YEAR
    reportGenerator.update(this.year, collapsed)
    this.$el.html(template_page)
    target.html(this.$el)
    const nav = this.$el.find('.dl-nav-select')
    nav.chosen()
    nav.val('').trigger('chosen:updated')
    nav.bind('change', this._onNavChange)
  }

  changeyear(e) {
    const target = $(e.delegateTarget)
    const lastYear = this.year
    const currentYear = target.attr('value')
    const newReport = (lastYear !== currentYear)
    this.year = target.attr('value')
    if (newReport) {
      let collapsed = false
      if ($('#accordion2 .accordion-body').hasClass('in')) {
        collapsed = true
      }
      reportGenerator.update(this.year, collapsed)
    }
  }

  _repaint(dataset = reportGenerator.dataset,
           questionSet = reportGenerator.questionSet,
           region = reportGenerator.region) {
    $('#custom-csv').html((reportGenerator.csvAnswers(dataset,
                                                       region,
                                                       questionSet,
                                                       false)).join('\n'))
  }

  _onNavChange(e) {
    let renderFiles
    const value = $(e.delegateTarget).val()
    const download = $('#dl-mode')
    download.empty()
    const all_downloads = [
      _EXPLORER_DATASET.downloads_old,
      ..._EXPLORER_DATASET.INDIVIDUAL_YEARS.map(
        year => _EXPLORER_DATASET.forYear(year).downloads
      ),
    ];
    if (value === 'fd') {
      renderFiles = {
        fd: true,
        sf: false,
        cq: false,
        cr: false,
        excel: all_downloads.map(y=> y[0]),
        csv: all_downloads.map(y=> y[1]),
        json: all_downloads.map(y=> y[2]),
      }
    } else if (value === 'sf') {
      renderFiles = {
        fd: false,
        sf: true,
        cq: false,
        cr: false
      }
    } else if (value === 'cq') {
      renderFiles = {
        fd: false,
        sf: false,
        cq: true,
        cr: false
      }
    } else if (value === 'cr') {
      renderFiles = {
        fd: false,
        sf: false,
        cq: false,
        cr: true
      }
    } else {
      renderFiles = {
        fd: false,
        sf: false,
        cq: false,
        cr: false
      }
    }
    download.append(template_files(renderFiles))
    if (value === 'cr') {
      $('#custom-csv').bind('click', (function (_this) {
        return function () {
          return $('#custom-csv').select()
        }
      })(this))
      $('input[name="downloadyear"]').bind('change', this.changeyear)
      this.$el.find('.download-csv').bind('click', reportGenerator._download)
      this._repaint()
    }
  }
}

export default DownloadPage
