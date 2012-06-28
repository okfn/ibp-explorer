template = require 'views/templates/sidebar'
application = require 'application'

class SidebarView extends Backbone.View
  template: template
  render: ->
    country_list = application.data.column('country').data
    _.each(country_list, 
        (country) => 
            link = template( { country: country } )
            $(link).appendTo( @$el )
    )
    this

module.exports = new SidebarView
