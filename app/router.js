'use strict'

import MapPage from './views/page/map.js'
import TimelinePage from './views/page/timeline.js'
import RankingsPage from './views/page/rankings.js'
import DownloadPage from './views/page/download.js'
import ProfilePage from './views/page/profile.js'
import AvailabilityPage from './views/page/availability.js'
import SplashPage from './views/page/splash.js'
import ParticipationPage from './views/page/participation.js'

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
  , downloadPage() {
    return this._download = this._download || new DownloadPage()
  }
  , splashPage() {
    return this._splash = this._splash || new SplashPage()
  }
  , participationPage() {
    return this._participation = this._participation || new ParticipationPage()
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
      , download: 'download'
      , participation: 'participation'
      , profile: 'profile'
      , 'profile/:country': 'profile'
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

  setCurrent(view, showReportGenerator = true) {
    if (!(view === this.currentView)) {
      this.currentView = view
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
    this.setCurrent(singletons.timelinePage(), showReportGenerator )
  }

  rankings() {
    this.setCurrent(singletons.rankingsPage())
  }

  availability() {
    const showReportGenerator = false
    this.setCurrent(singletons.availabilityPage(), showReportGenerator)
  }

  download() {
    this.setCurrent(singletons.downloadPage())
  }

  participation() {
    const showReportGenerator = false
    this.setCurrent(singletons.participationPage(), showReportGenerator)
  }

  profile(country = '') {
    this.setCurrent(new ProfilePage(country))
  }
}

export default OBSRouter
