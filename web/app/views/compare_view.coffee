template = require 'views/templates/compare'
application = require 'application'
util = require 'util'

module.exports = class CompareView extends Backbone.View
  id: 'view-compare'
  initialize: (@countries) ->
    data = []
    all_answers = (@lookup_row c for c in @countries)
    # TODO questions.length does not match answers.length
    #for i in [1..application.questions.length-1]
    for i in [1..123]
        answers = (util.answerDict(row,i) for row in all_answers)
        data.push
          id: i
          question: application.questions[i].question
          answers: answers
    missing_countries = _.difference application.answers.column('country').data, @countries
    @renderData = 
      countries: @countries
      title: @countries.join(', ')
      view_without: (@view_without c for c in @countries)
      view_with: (@view_with c for c in missing_countries)
      data: data

  lookup_row: (country) =>
    query = application.answers.rows( (row)=>row.country==country )
    if not query.length
      throw ('"'+country+'" not in dataset.')
    query.rowByPosition(0)

  view_without: (withoutMe) =>
    list = _.without @countries, withoutMe
    name: withoutMe
    link: '#compare/'+list.join('/')

  view_with: (withMe) =>
    list = @countries.slice(0)
    list.push withMe
    name: withMe
    link: '#compare/'+list.join('/')

  click_add_country: (event, value) =>
    country = $(event.target).val()
    Backbone.history.navigate(window.location.hash+'/'+country,{trigger:true})

  render: =>
    dom = $(template @renderData)
    @$el.append dom
    this

  post_render: =>
    @$el.find('#compare-add-country').change @click_add_country
    @$el.find('#compare-add-country').chosen()
  

