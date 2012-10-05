template_page = require 'views/templates/page/rankings'
template_rankings_row = require 'views/templates/rankings_row'
template_rankings_tooltip = require 'views/templates/rankings_tooltip'
util = require 'util'

reportGenerator = require 'views/reportgenerator'

IBP_COLORS = [
  '#B7282E'
  '#F58024'
  '#DAC402'
  '#22aa33'
]

module.exports = class ProjectPage extends Backbone.View
    ##################
    ## Public methods
    ##################
    initialize: =>
        reportGenerator.bind 'update', @_reflow

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el
        $('#rankings-toggles button').click @_rankingsToggle
        $('button[data-year="2010"]').click()

    ##################
    ## Private methods
    ##################
    _rankingsToggle: (e) =>
        target = $(e.delegateTarget)
        $('#rankings-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        @_reflow()

    _count: (array,search,questionSet) ->
        total = 0
        for q in questionSet
            if (array[q]==search) then total++
        return total

    _findScore: (dataset,country,year) ->
        for x in dataset
            if x.alpha2==country
                return x[year]
        assert false, 'couldnt find country: '+country

    _reflow: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet) =>
        target = $('#rankings').empty()
        if questionSet.length==0 
            target.html '(No questions selected)'
            return
        data = []
        for country in _EXPLORER_DATASET.country
            if not (('db_'+@year) of country) then continue
            db = country['db_'+@year]
            obj = 
                country: country.name
                alpha2: country.alpha2
                score: @_findScore dataset,country.alpha2,@year
                a: (@_count db, 100, questionSet)
                b: (@_count db, 67, questionSet)
                c: (@_count db, 33, questionSet)
                d: (@_count db, 0, questionSet)
                e: (@_count db, -1, questionSet)
            obj.total = obj.a+obj.b+obj.c+obj.d+obj.e
            obj.pa = ((obj.a*100)/obj.total)
            obj.pb = ((obj.b*100)/obj.total)
            obj.pc = ((obj.c*100)/obj.total)
            obj.pd = ((obj.d*100)/obj.total)
            obj.pe = ((obj.e*100)/obj.total)
            data.push obj
        data.sort util.sortFunction
        for obj in data
            el = $(template_rankings_row obj).appendTo(target)

