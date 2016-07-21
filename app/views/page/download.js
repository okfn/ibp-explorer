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
    this.year = '2015'
    reportGenerator.update(this.year, collapsed)
    this.$el.html(template_page)
    target.html(this.$el)
    let nav = this.$el.find('.dl-nav-select')
    nav.chosen()
    nav.val('').trigger('liszt:updated')
    nav.bind('change', this._onNavChange)
  }

  changeyear(e) {
    const target = $(e.delegateTarget)
    const lastYear = this.year
    const currentYear = target.attr('value')
    const newReport = lastYear === '2015' || currentYear === '2015'
    this.year = target.attr('value')
    if (this.year === 'all') {
      this.year = '2006'
    }
    if (newReport) {
      let collapsed = false
      if ($('#accordion2 .accordion-body').hasClass('in')) {
        collapsed = true
      }
      reportGenerator.update(this.year, collapsed)
    }
    this._repaint()
  }

  _writeLine(out, x) {
    _.forEach(_.range(x.length), (index) => {
      let element = x[index] || ''
      assert(!_.contains(element, '"'), 'Cannot encode string: ' + element)
      if (_.contains(element, ',')) {
        x[index] = '"' + element + '"'
      }
    })
    return out.push(x.join(','))
  }

  _csvQuestions(questionSet) {
    // Prep
    let out = []
    // Headers
    const headers = ['NUMBER','TEXT','A','B','C','D','E']
    this._writeLine(out, headers)
    // Content
    const q = _EXPLORER_DATASET.question
    _.forEach(questionSet, (x) => {
      this._writeLine(out, [x, q[x].text, q[x].a, q[x].b, q[x].c, q[x].d, q[x].e])
    })
    return out
  }

  _number_to_letter(value) {
    //The given letters in the source data arent always there.
    // 'q102l' does not exist while 'q102' does.
    // Therefore it is safer to use this technique to extract a letter...
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
    let headers = ['COUNTRY', 'COUNTRY_NAME', 'YEAR', 'SCORE']
    _.forEach(questionSet, (x) => {
      headers.push(x.toString())
    })
    _.forEach(questionSet, (x) => {
      headers.push(x+'l')
    })
    //console.log("headers: ", headers)
    //this._writeLine(out, headers)
    // Quickly lookup country data
    let tmp = {}
    _.forEach(datasetCountry, (x) => {
      tmp[x.alpha2] = x
    })
    // Compile a CSV in the browser
    let selected_countries = []
    _.forEach(region, (reg) => {
      _.forEach(datasetRegions[reg].contains, (contained) => {
        selected_countries.push(contained)
      })
    })
    _.forEach(dataset, (country) => {
      if (!(_.contains(selected_countries, country.alpha2))) return
      let selected_year = $('input[name="downloadyear"]:checked').val()
      if (!(_.contains(all_years, selected_year))) {
        selected_year = all_years
      } else {
        selected_year = [selected_year]
      }
      _.forEach(selected_year, (year) => {
        if (!(_.has(country, year))) return
        let row =[country.alpha2, country.country, year, country[year]]
        _.forEach(questionSet, (q) => {
          row.push(tmp[country.alpha2]['db_'+year][q])
        })
        _.forEach(questionSet, (q) => {
          let value = tmp[country.alpha2]['db_'+year][q]
          row.push(this._number_to_letter(value))
        })
        assert(row.length==headers.length)
        this._writeLine(out, row)
      })
    })
    return out
  }

  _repaint(dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) {
    $('#custom-csv').html((this._csvAnswers(dataset, region, questionSet)).join('\n'))
  }

  _onNavChange(e) {
    let renderFiles
    const value = $(e.delegateTarget).val()
    let download = $('#dl-mode')
    download.empty()
    if (value === 'fd') {
      renderFiles = {
        fd: true,
        sf: false,
        cq: false,
        cr: false,
        excel: [_EXPLORER_DATASET.downloads_old[0], _EXPLORER_DATASET.downloads[0]],
        csv: [_EXPLORER_DATASET.downloads_old[1], _EXPLORER_DATASET.downloads[1]],
        json: [_EXPLORER_DATASET.downloads_old[2], _EXPLORER_DATASET.downloads[2]]
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
      this._repaint()
      let options = {
        filename() {
          return 'custom-budget-report.csv'
        },
        data() {
            return $('#custom-csv').val()
        },
        onComplete() {
          return alert('Your File Has Been Saved!')
        },
        onCancel() {
          return null
        },
        onError() {
          return alert('Error')
        },
        swf: 'downloadify.swf',
        downloadImage: 'images/download.png',
        width: 100,
        height: 30,
        transparent: true,
        append: false
      }
      Downloadify.create('downloadify', options)
    }
  }
}

export default DownloadPage