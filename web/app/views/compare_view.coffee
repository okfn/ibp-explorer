template = require 'views/templates/compare'
application = require 'application'
util = require 'util'

module.exports = class CompareView extends Backbone.View
  id: 'view-compare'
  initialize: (@category,@countries) ->
    data = []
    all_answers = (@lookup_row c for c in @countries)
    # Used to render the template
    Handlebars.registerHelper 'selected', (id) =>
      if id==@category then 'selected' else ''
    included = application.groupingsMap[@category]
    Handlebars.registerHelper 'included', ->
      _.contains(included, this.id)
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
      view_with: (c for c in missing_countries)
      data: data
      groupings: application.groupings

  lookup_row: (country) =>
    query = application.answers.rows( (row)=>row.country==country )
    if not query.length
      throw ('"'+country+'" not in dataset.')
    query.rowByPosition(0)

  view_without: (withoutMe) =>
    list = _.without @countries, withoutMe
    name: withoutMe
    link: @route(@category, list)

  click_add_country: (event) =>
    country = $(event.target).val()
    Backbone.history.navigate( @route(@category,@countries.concat(country)), {trigger: true})

  click_choose_group: (event) =>
    category = $(event.target).val()
    Backbone.history.navigate( @route(category,@countries), {trigger: true})

  route: (category, countries) ->
    if category
      category = 'category/'+category+'/'
    '#compare/'+category+countries.join('/')

  render: =>
    dom = $(template @renderData)
    @$el.append dom
    this

  post_render: =>
    @$el.find('#compare-add-country').change(@click_add_country).chosen()
    @$el.find('#compare-choose-group').change(@click_choose_group).chosen()
  

