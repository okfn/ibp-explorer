import { View } from 'backbone'
import _ from 'underscore'
import pagination from '../../../vendor/scripts/pagination.min'

import template_page from '../templates/page/search.hbs'
import template_search_row from '../templates/search_row.hbs'

class SearchPage extends View {

  initialize() {
    this._onFilterChange = _.bind(this._onFilterChange, this)
    this._onUploadsChange = _.bind(this._onUploadsChange, this)
    this._reflowResults = _.bind(this._reflowResults, this)
    this._getFilteredResults = _.bind(this._getFilteredResults, this)
    this._setAllOnFilters = _.bind(this._setAllOnFilters, this)
    this._onFiltersReset = _.bind(this._onFiltersReset, this)
    //TODO this should get inmplemented in the indaba-client once gdrive is ready for that
    _SEARCH_DATASET.documents = _.filter(_SEARCH_DATASET.documents, (document) => {
      if (document.uploads) {
        let found = _.find(document.uploads, (upload) => {
          return upload.driveId
        })
        if (found) {
          return true
        }
      }
      return false
    })
    this.documents = _SEARCH_DATASET.documents
    this.activeFilters = {}
    this.filtersChanged = false
  }

  renderPage(target) {
    this.$el.html(template_page({
                                  countries: _SEARCH_DATASET.countries,
                                  document_types: _SEARCH_DATASET.document_types,
                                  years: _SEARCH_DATASET.years,
                                  states: _SEARCH_DATASET.states,
                                  documents: this.documents
                                }))
    target.html(this.$el)
    let nav = this.$el.find('.chosenify')
    nav.chosen()
    $(nav).bind('change', this._onFilterChange)
    $('#search-reset').bind('click', this._onFiltersReset)
  }

  _getFilteredResults(subset = true) {
    if (subset){
      return _.where(this.documents, this.activeFilters)
    } else {
      return _.where(_SEARCH_DATASET.documents, this.activeFilters)
    }
  }

  _setAllOnFilters() {
    if (!this.filtersChanged) {
      $('.chosenify option:first-child').html('All')
      $('.chosenify').trigger('chosen:updated')
      this.filtersChanged = true
    }
  }

  _onFilterChange(e) {
    this._setAllOnFilters()
    if ($(e.delegateTarget).val() != '') {
      if (this.activeFilters[e.target.id]) {
        //Active filter has changed, search trough all documents again
        this.documents = _SEARCH_DATASET.documents
      }
      this.activeFilters[e.target.id] = $(e.delegateTarget).val()
    } else {
      this.documents = _SEARCH_DATASET.documents
      delete this.activeFilters[e.target.id]
    }
    this.documents = this._getFilteredResults()
    this._reflowResults()
  }

  _onUploadsChange(e) {
    this._setAllOnFilters()
    if (e.target.checked) {
      this.documents = _.filter(this.documents, (document) => {
        if (document.uploads) {
          let found = _.find(document.uploads, (upload) => {
            return upload.driveId
          })
          if (found) {
            return true
          }
        }
        return false
      })
      this._reflowResults()
    } else {
      this.documents = this._getFilteredResults(false)
      this._reflowResults()
    }
  }

  _onFiltersReset() {
    $('#results-container').html('')
    $('#pagination').html('')
    $('#country option:first-child').html('Select Country...')
    $('#type option:first-child').html('Select Type...')
    $('#year option:first-child').html('Select Year...')
    $('#state option:first-child').html('Select State...')
    $('#gdrive-checkbox').prop('checked', false)
    $('.chosenify').val('').trigger('chosen:updated')
    this.documents = _SEARCH_DATASET.documents
    this.activeFilters = {}
    this.filtersChanged = false
  }

  _reflowResults() {
    if (this.documents.length) {
      $('#pagination').show()
      $('#pagination').pagination({
                                    dataSource: this.documents,
                                    callback: (data, pagination) => {
                                      $('#results-container')
                                        .html(template_search_row({documents: data}))
                                      $("html, body").animate({ scrollTop: 120 }, "slow");
                                    }
                                  })
    } else {
      $('#pagination').hide()
      $('#results-container').html(template_search_row({
                                                      documents: []
                                                    }))
    }
  }
}

export default SearchPage
