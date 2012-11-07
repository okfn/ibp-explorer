template_page = require 'views/templates/page/profile'

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
            dataJson: JSON.stringify @data
            empty: @alpha2==""
            percentages: [
                @_get_percentages @data.db_2006, '2006'
                @_get_percentages @data.db_2008, '2008'
                @_get_percentages @data.db_2010, '2010'
                @_get_percentages @data.db_2012, '2012'
            ]

        @$el.html template_page renderData
        target.html @$el
        @_repaint()
        # Set up nav
        nav = @$el.find('.country-nav-select')
        nav.val @alpha2
        nav.bind('change',@_onNavChange)
        # Add tooltips to nav bars
        ###
        $('.percentbar').tooltip
            placement: 'right'
            delay: 50
            animation: true
        ###


    ##################
    ## Private methods
    ##################
    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet) =>

    _onNavChange: (e) =>
        value = $(e.delegateTarget).val()
        if value.length==0
            window.location = '#profile'
        else
            assert value.length==2,'Invalid country code: '+value
            window.location = '#profile/'+value

    _get_percentages: (data,year) ->
        if data is undefined
            return {year:year,not_defined:true}
        TOTAL = 125
        out = 
            year: year
            a_count: 0
            b_count: 0
            c_count: 0
            d_count: 0
            e_count: 0
        for i in [1..TOTAL]
            letter = data[i+'l']
            if not letter then letter='e'
            assert letter in ['a','b','c','d','e'] # Ensure that it's a predefined [a,b,c,d,e] key
            out[letter+'_count']++
        assert out.a_count+out.b_count+out.c_count+out.d_count+out.e_count==TOTAL,"Integrity problem in profile calculation"
        # Calculate bar widths. They are superimposed on top of each other, in decreasing width..
        out.a_width = (out.a_count)*100/TOTAL
        out.b_width = (out.a_count+out.b_count)*100/TOTAL
        out.c_width = (out.a_count+out.b_count+out.c_count)*100/TOTAL
        out.d_width = (out.a_count+out.b_count+out.c_count+out.d_count)*100/TOTAL
        out.e_width = 100
        out.json = JSON.stringify out
        return out



