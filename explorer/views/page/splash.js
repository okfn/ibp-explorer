'use strict'

import { View } from 'backbone'
import _ from 'underscore'

import template_page from '../templates/page/splash.hbs'

class SplashPage extends View {
  // Public methods

  renderPage(target) {
    // Write to DOM
    this.$el.html(template_page({
      calc_year: (parseInt(_EXPLORER_DATASET.THIS_YEAR) + 2).toString()
    }))
    target.html(this.$el)
    // Bind to on-page elements
    // ... nothing to bind on this page
  }
}


export default SplashPage
