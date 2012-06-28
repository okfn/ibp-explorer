template = require 'views/templates/sidebar'
application = require 'application'

class SidebarView extends Backbone.View
  template: template
  render: ->
    renderData = 
      countries: application.data.column('country').data

    @$el.append( template(renderData) )
    this

module.exports = new SidebarView()
