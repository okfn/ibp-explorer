template_page = require 'views/templates/page/profile'
template_profile_percentages = require 'views/templates/profile_percentages'
template_profile_details = require 'views/templates/profile_details'
template_profile_details_future = require 'views/templates/profile_details_future'
template_question_text = require 'views/templates/question_text'

reportGenerator = require 'views/reportgenerator'

module.exports = class ProfilePage extends Backbone.View
    ##################
    ## Public methods
    ##################
    initialize: (@alpha2) =>
        @data = @lookup @alpha2
        @db_2017 = $.extend {}, @data.db_2015
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
            main_website_url: @_ibp_website_url @alpha2
        @viewPast = true
        @$el.html template_page renderData
        target.html @$el
        @_repaint()
        # Set up nav
        nav = @$el.find('.country-nav-select')
        nav.chosen()
        nav.val(@alpha2).trigger('liszt:updated')
        nav.bind('change',@_onNavChange)
        # Bind to past/future toggle
        $('#profile-toggle input').bind 'change', @_onToggleMode

    ##################
    ## Private methods
    ##################
    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet) =>
        percentageData = 
            percentages: [
                @_get_percentages @data.alpha2, @data.db_2006, '2006', questionSet
                @_get_percentages @data.alpha2, @data.db_2008, '2008', questionSet
                @_get_percentages @data.alpha2, @data.db_2010, '2010', questionSet
                @_get_percentages @data.alpha2, @data.db_2012, '2012', questionSet
                @_get_percentages @data.alpha2, @data.db_2015, '2015', questionSet
            ]
        # IE hack requires we empty & append rather than use .html()
        $('.percentages').empty().append($(template_profile_percentages percentageData))
        # Add tooltips to nav bars
        $('.percentbar').tooltip
            placement: 'right'
            delay: 50
            animation: true
        detailsData = 
            @_get_details @data, questionSet
        if @viewPast
            $('.past').show()
            $('.future').hide()
            $('.details').html(template_profile_details detailsData)
        else
            $('.future').show()
            $('.past').hide()
            $('.details').html(template_profile_details_future detailsData)
            $('.letter.multi img').bind 'click', @_onClick2014
            @_repaint2014
            for x in $('.question-row')
                x = $(x)
                qnum = parseInt(x.attr('data-question-number'))
                score = @db_2017[qnum]
                x.find('img[data-score="'+score+'"]').removeClass('inactive').addClass('active')
        @_repaint2014()
        # Add question number hover effect
        @$el.find('tr.question-row').mouseover @_onHoverQuestion
        @$el.find('tr.question-row:first').mouseover()
        # Fill out scores
        render_score = (year,score)->
            if not (score is undefined)
                $('.scores .year-'+year).css('opacity','1.0')
                $('.scores .year-'+year+' .bottom').text 'Score: '+score
            else
                $('.scores .year-'+year).css('opacity','0.2')
                $('.scores .year-'+year+' .bottom').text '-'
        render_score 2006,percentageData.percentages[0].score
        render_score 2008,percentageData.percentages[1].score
        render_score 2010,percentageData.percentages[2].score
        render_score 2012,percentageData.percentages[3].score
        render_score 2015,percentageData.percentages[4].score
        @_repaint2014()

    _ibp_website_url: (alpha2) ->
        # Special cases: Links are inconsistent on the core website
        if alpha2=='BJ' then alpha2 = 'benin'
        if alpha2=='QA' or alpha2=='TN' or alpha2=='MM' 
            # Quatar Tunisia and Myanmar have no page
            return ''
        return 'http://internationalbudget.org/what-we-do/open-budget-survey/country-info/?country='+alpha2.toLowerCase()

    _onHoverQuestion: (e) ->
        target = $(e.delegateTarget)
        number = target.attr('data-question-number')
        q = _EXPLORER_DATASET.question[number]
        qbox = $('.question-box')
        qbox.html(template_question_text q)
        top = target.position().top - 21
        max_top = $('.details').height() - qbox.height() - 21
        qbox.css
            left : $('.details table').width()
            top: Math.max(0, (Math.min top, max_top))
        $('tr.question-row').removeClass 'hover'
        target.addClass 'hover'

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

    _get_percentages: (alpha2,data,year,questionSet) ->
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
        for x in reportGenerator.dataset
            if x.alpha2==alpha2
                out.score = x[year]
                if out.score < 0 then out.score = 'N/A'
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
                l2015: @_number_to_letter data.db_2015, x
        return out

    _onToggleMode: =>
        _viewPast = @viewPast
        @viewPast = not $('#profile-toggle input').is(':checked')
        animate = not (_viewPast==@viewPast)
        # Populate the DOM
        @_repaint()
        explanation = $('.explanation')
        if not @viewPast
            explanation.show()
            if animate
                $('.future').css('opacity',0).animate({'opacity':1},300)
        else 
            explanation.hide()

    _onClick2014: (e) =>
        el = $(e.delegateTarget)
        tr = el.parents('tr:first')
        qnum = tr.attr('data-question-number')
        score = el.attr('data-score')
        tr.find('img').removeClass('active').addClass('inactive')
        el.removeClass('inactive').addClass('active')
        @db_2017[qnum] = parseInt(score)
        @_repaint2014()
        @_animationHackScale $('.year-box.year-2017')

    _repaint2014: =>
        score = reportGenerator.calculateScore @db_2017, reportGenerator.questionSet
        score = Math.round(score)
        $('.scores .year-2017 .bottom').text 'Score: '+score

    _animationHackScale: (element, scale=1.3, time=340) =>
        """Hacky function to make an element pulse to a new scale and back again.
          Follows a SIN wave. Looks like a heartbeat. Overwrites the font-size property. Hence hacky."""
        element = $(element)
        element.css('font-size',100)
        element.animate( 
          { 'font-size': 0 },
          { 
            duration: time
            easing: 'linear'
            step: (now,fx) => 
              x = (now*Math.PI)/100 # 0 to PI
              x = 1 + (Math.sin(x)*(scale-1)) # 1 to SCALE and back again
              _scale = 'scale('+x+','+x+')'
              element.css 
                '-moz-transform':_scale
                '-o-transform':_scale
                '-ms-transform':_scale
                '-webkit-transform':_scale
                'transform':_scale
          } 
        )
