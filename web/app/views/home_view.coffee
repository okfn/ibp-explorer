template = require './templates/home'
application = require 'application'

module.exports = class HomeView extends Backbone.View
  status: ->
    ds = application.answers
    rows: ds.length
    columns: ds.columnNames().length
    countries: ds.column('country').data

  render: =>
    renderdata = 
      status: @status()
      dump_questions: JSON.stringify(application.questions,null,2)
      dump_answers: JSON.stringify(application.answers,null,2)
    @$el.html template renderdata
    this
