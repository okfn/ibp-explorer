template = require './templates/home'

module.exports = class HomeView extends Backbone.View
  id: 'home-view'
  render: =>
    @$el.html template
    this
