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

    sortByName: false

    ##################
    ## Public methods
    ##################
    initialize: =>
        reportGenerator.bind 'update', @_reflow

    renderPage: (target) =>
        $(window).scrollTop(0)
        @$el.html template_page()
        target.html @$el
        $('.sortbyname').click @_sortByNameToggle
        $('.sortbyname[data-sortbyname="'+@sortByName+'"]').addClass 'active'
        $('#rankings-toggles button').click @_rankingsToggle
        $('button[data-year="2015"]').click()

    ##################
    ## Private methods
    ##################
    _rankingsToggle: (e) =>
        target = $(e.delegateTarget)
        lastYear = $('#rankings-toggles button.active').attr('data-year')
        currentYear = target.attr('data-year')
        newReport = (lastYear == '2015' || currentYear == '2015')
        $('#rankings-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        if newReport
            collapsed = false
            if $('#accordion2 .accordion-toggle').hasClass 'collapsed'
                collapsed = true
            reportGenerator.update(@year, collapsed)
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
        #assert false, 'couldnt find country: '+country

    _sortByNameToggle: (e) =>
        e.preventDefault()
        target = $(e.delegateTarget)
        $('.sortbyname').removeClass 'active'
        target.addClass 'active'
        @sortByName = target.attr('data-sortbyname')=='true'
        @_reflow()
        return false

    _reflow: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) =>
        if @year != '2015'
            datasetRegions = _EXPLORER_DATASET.regions_old
            datasetCountry = _EXPLORER_DATASET.country_old
        else
            datasetRegions = _EXPLORER_DATASET.regions
            datasetCountry = _EXPLORER_DATASET.country
        target = $('#rankings-table tbody').empty()
        if questionSet.length==0 
            target.html '<p style="margin: 4px 15px; font-weight: bold; min-width: 400px;">(No questions selected)</p>'
            return
        data = []
        selected_countries = []
        for reg in region
            for contained in datasetRegions[reg].contains
                selected_countries.push(contained)
        for country in datasetCountry
            if not (('db_'+@year) of country) then continue
            if not (country.alpha2 in selected_countries) then continue
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
            obj.a_width = ((obj.a*100)/obj.total)
            obj.b_width = ((obj.b*100)/obj.total)
            obj.c_width = ((obj.c*100)/obj.total)
            obj.d_width = ((obj.d*100)/obj.total)
            obj.e_width = ((obj.e*100)/obj.total)
            obj.b_left = obj.a_width
            obj.c_left = obj.b_width + obj.b_left
            obj.d_left = obj.c_width + obj.c_left
            obj.e_left = obj.d_width + obj.d_left
            data.push obj
        if @sortByName
            data.sort util.sortFunctionByName
        else
            data.sort util.sortFunction
        for obj in data
            if obj.score<0
                obj.score = 'N/A'
            el = $(template_rankings_row obj).appendTo(target)
        $('.percentbar').tooltip
            placement: 'right'
            delay: 50
            animation: true

