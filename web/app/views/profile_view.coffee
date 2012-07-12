template = require 'views/templates/profile'
application = require 'application'
util = require 'util'

module.exports = class ProfileView extends Backbone.View
  template: template
  id: 'profile-table'

  initialize: (@countryName) ->
    if not @countryName
      @renderData = 
        country: '<span style="font-weight: normal; font-style: italic;">&laquo; Select a country</span>'
        countries: application.countries
    else 
      query = application.answers.rows( (row)=>row.country==@countryName )
      if not query.length
        throw ('"'+@countryName+'" not in dataset.')
      row = query.rowByPosition(0)
      data = (row,i) ->
        id: i
        question: application.questions[i].question
        answer: util.answerDict(row,i)
      @renderData = 
        country: row.country
        data: data(row,i) for i in [1..123] 
        countries: application.countries

  render: =>
    dom = template @renderData
    @$el.append dom
    this

  post_render: =>
    $('.pie').peity('pie')
    $('.bar').peity('bar_multicolour', {colour: ['#faeac8', '#f8c175', '#f5854e', '#cb3727']} )



