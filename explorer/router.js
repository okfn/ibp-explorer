'use strict'

import MapPage from './views/page/map.js'
import TimelinePage from './views/page/timeline.js'
import RankingsPage from './views/page/rankings.js'
import DownloadPage from './views/page/download.js'
import ProfilePage from './views/page/profile.js'
import AvailabilityPage from './views/page/availability.js'
import AvailabilityHistPage from './views/page/availabilityHistorical.js'
import SplashPage from './views/page/splash.js'
import ParticipationPage from './views/page/participation.js'
import SearchPage from './views/page/search.js'

// Singleton report generator
import reportGenerator from './views/reportgenerator.js'

// Function to consistently target the main div
// Generator of singleton view pages
const singletons = {
  mapPage() {
    return this._map = this._map || new MapPage()
  }
  , timelinePage() {
    return this._timeline = this._timeline || new TimelinePage()
  }
  , rankingsPage() {
    return this._rankings = this._rankings || new RankingsPage()
  }
  , availabilityPage() {
    return this._avail = this._avail || new AvailabilityPage()
  }
  , availabilityHistPage() {
    return this._availHist = this._availHist || new AvailabilityHistPage()
  }
  , downloadPage() {
    return this._download = this._download || new DownloadPage()
  }
  , splashPage() {
    return this._splash = this._splash || new SplashPage()
  }
  , participationPage() {
    return this._participation = this._participation || new ParticipationPage()
  }
  , searchPage() {
    return this._search = this._search || new SearchPage()
  }
}

class OBSRouter extends Backbone.Router {

  get routes() {
    return {
      '': 'home'
      , home: 'home'
      , map: 'map'
      , timeline: 'timeline'
      , rankings: 'rankings'
      , availability: 'availability'
      , 'availability-historical': 'availabilityHistorical'
      , download: 'download'
      , participation: 'participation'
      , profile: 'profile'
      , 'profile/:country': 'profile'
      , 'profile/:country?*params': 'profile'
      , search: 'search'
    }
  }

  initialize() {
    // Create basic page
    reportGenerator.render($('#report-generator'))
    reportGenerator.setInitialState()
    // Trigger nav updates
    this.on('all', (trigger) => {
      const location = window.location.hash.slice(1)
      trigger = trigger.split(':')
      if (trigger[0] === 'route') {
        $('#main-nav li').removeClass('active')
        let active = $(`#main-nav li a[href$="#${location}"]`)
        if (active.length === 0) {
          active = $(`#main-nav li a[href$="#${trigger[1]}"]`)
        }
        active = $(active.parents('li')[0])
        active.add(active.parents('.dropdown')).addClass('active')
      }
    })
  }

  setCurrent(view, showReportGenerator = true, viewName = 'default') {
    if (!(view === this.currentView)) {
      this.currentView = view
      $('#explorer').parents('.site-main').attr('id', viewName)
      view.renderPage($('#explorer'))
    }
    if (showReportGenerator) {
      $('#report-generator').show()
    } else {
      $('#report-generator').hide()
    }
  }

  home() {
    const showReportGenerator = false
    this.setCurrent(singletons.splashPage(), showReportGenerator)
  }

  map() {
    this.setCurrent(singletons.mapPage())
  }

  timeline() {
    const showReportGenerator = false
    this.setCurrent(singletons.timelinePage(), showReportGenerator, 'timeline')
  }

  rankings() {
    this.setCurrent(singletons.rankingsPage())
  }

  availability() {
    const showReportGenerator = false
    this.setCurrent(singletons.availabilityPage(), showReportGenerator)
  }

  availabilityHistorical() {
    const showReportGenerator = false
    this.setCurrent(singletons.availabilityHistPage(), showReportGenerator)
  }

  download() {
    this.setCurrent(singletons.downloadPage())
  }

  participation() {
    const showReportGenerator = false
    this.setCurrent(singletons.participationPage(), showReportGenerator)
  }

  profile(country = '', params = '') {
    this.setCurrent(new ProfilePage(country, params))
  }

  search() {
    const showReportGenerator = false
    this.setCurrent(singletons.searchPage(), showReportGenerator)
  }
}

export default OBSRouter
