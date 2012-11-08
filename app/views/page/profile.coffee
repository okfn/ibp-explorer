template_page = require 'views/templates/page/profile'
template_profile_percentages = require 'views/templates/profile_percentages'
template_profile_details = require 'views/templates/profile_details'

reportGenerator = require 'views/reportgenerator'

module.exports = class ProfilePage extends Backbone.View
    ##################
    ## Public methods
    ##################
    initialize: (@alpha2) =>
        @data = @lookup @alpha2
        reportGenerator.bind 'update', @_repaint

    lookup: (alpha2) ->
        """Look up a country object by alpha2 code"""
        for x in _EXPLORER_DATASET.country
            if x.alpha2==alpha2 then return x
        if alpha2=="" then return {}
        assert false, alpha2+' is not a valid country code.'
        
    renderPage: (target) =>
        renderData =
            alpha2: @alpha2
            countries: _EXPLORER_DATASET.country
            data: @data
            empty: @alpha2==""

        @$el.html template_page renderData
        target.html @$el
        @_repaint()
        # Set up nav
        nav = @$el.find('.country-nav-select')
        nav.val @alpha2
        nav.bind('change',@_onNavChange)


    ##################
    ## Private methods
    ##################
    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet) =>
        percentageData = 
            percentages: [
                @_get_percentages @data.db_2006, '2006', questionSet
                @_get_percentages @data.db_2008, '2008', questionSet
                @_get_percentages @data.db_2010, '2010', questionSet
                @_get_percentages @data.db_2012, '2012', questionSet
            ]
        $('.percentages').html(template_profile_percentages percentageData)
        # Add tooltips to nav bars
        $('.percentbar').tooltip
            placement: 'right'
            delay: 50
            animation: true
        detailsData = 
            @_get_details @data, questionSet
        $('.details').html(template_profile_details detailsData)

    _onNavChange: (e) ->
        value = $(e.delegateTarget).val()
        if value.length==0
            window.location = '#profile'
        else
            assert value.length==2,'Invalid country code: '+value
            window.location = '#profile/'+value

    _number_to_letter: (dataset, questionNumber) ->
        """The given letters in the source data arent always there. 
          'q102l' does not exist while 'q102' does.
          Therefore it is safer to use this technique to extract a letter..."""
        if dataset is undefined then return ''
        value = dataset[questionNumber]
        assert value in [-1,0,33,67,100], 'Invalid value: '+value
        return {
          '-1': 'e'
          0: 'd'
          33: 'c'
          67: 'b'
          100: 'a'
        }[value]

    _get_percentages: (data,year, questionSet) ->
        if data is undefined
            return {year:year,not_defined:true}
        out = 
            total: questionSet.length
            year: year
            a: 0
            b: 0
            c: 0
            d: 0
            e: 0
        for i in questionSet
            letter = @_number_to_letter data, i
            assert letter in ['a','b','c','d','e'] # Ensure that it's a predefined [a,b,c,d,e] key
            out[letter]++
        assert out.a+out.b+out.c+out.d+out.e==out.total,"Integrity problem in profile calculation"
        # Calculate bar widths. They are superimposed on top of each other, in decreasing width..
        out.a_width = (out.a)*100/out.total
        out.b_width = (out.a+out.b)*100/out.total
        out.c_width = (out.a+out.b+out.c)*100/out.total
        out.d_width = (out.a+out.b+out.c+out.d)*100/out.total
        out.e_width = 100
        out.json = JSON.stringify out
        return out

    _get_details: (data,questionSet) ->
        out = 
            questions: []
        for x in questionSet
            out.questions.push
                number: x
                l2006: @_number_to_letter data.db_2006, x
                l2008: @_number_to_letter data.db_2008, x
                l2010: @_number_to_letter data.db_2010, x
                l2012: @_number_to_letter data.db_2012, x
        return out


