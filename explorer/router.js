'use strict'

import MapPage from './views/page/map.js'
import TimelinePage from './views/page/timeline.js'
import RankingsPage from './views/page/rankings.js'
import DownloadPage from './views/page/download.js'
import ProfilePage from './views/page/profile.js'
import CalculatorPage from './views/page/calculator.js'
import AvailabilityPage from './views/page/availability.js'
import SplashPage from './views/page/splash.js'
import SearchPage from './views/page/search.js'

// Singleton report generator
import reportGenerator from './views/reportgenerator.js'

// Function to consistently target the main div
// Generator of singleton view pages
const singletons = {
  mapPage() {
    this._map = this._map || new MapPage()
    this._map.initialize()
    return this._map
  },
  timelinePage() {
    this._timeline = this._timeline || new TimelinePage()
    this._timeline.initialize()
    return this._timeline
  },
  rankingsPage() {
    this._rankings = this._rankings || new RankingsPage()
    this._rankings.initialize()
    return this._rankings
  },
  availabilityPage() {
    this._availHist = this._availHist || new AvailabilityPage()
    this._availHist.initialize()
    return this._availHist
  },
  downloadPage() {
    this._download = this._download || new DownloadPage()
    this._download.initialize()
    return this._download
  },
  splashPage() {
    this._splash = this._splash || new SplashPage()
    this._splash.initialize()
    return this._splash
  },
  calculatorPage() {
    this._calculator = this._calculator || new CalculatorPage()
    this._calculator.initialize()
    return this._calculator
  },
  searchPage() {
    this._search = this._search || new SearchPage()
    this._search.initialize()
    return this._search
  }
}

class OBSRouter extends Backbone.Router {

  get routes() {
    return {
      '': 'home',
      home: 'home',
      map: 'map',
      timeline: 'timeline',
      rankings: 'rankings',
      availability: 'availability',
      download: 'download',
      // participation: 'participation',
      calculator: 'calculator',
      'calculator/:country': 'calculator',
      'calculator/:country?*params': 'calculator',
      profile: 'profile',
      'profile/:country': 'profile',
      'profile/:country?*params': 'profile',
      search: 'search'
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

  download() {
    this.setCurrent(singletons.downloadPage())
  }

  calculator(country = '', params = '') {
    this.setCurrent(new CalculatorPage(country, params))
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
