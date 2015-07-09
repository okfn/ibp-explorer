template_page = require 'views/templates/page/participation'
template_row = require 'views/templates/participation_row'
template_comments = require 'views/templates/participation_comments'
util = require 'util'

module.exports = class ProjectPage extends Backbone.View

    sortBy: '114'

    ##################
    ## Public methods
    ##################
    initialize: () =>
        @participation = _EXPLORER_DATASET.public_participation

    renderPage: (target) =>
        $(window).scrollTop(0)
        @region = '0'
        @countriesIncluded = []
        for contained in _EXPLORER_DATASET.regions[parseInt(@region)].contains
            @countriesIncluded.push(contained)
        @renderData =
            questions: @_getQuestions()
            countries: @_getCountry()
        @$el.html template_page @renderData
        target.html @$el
        $('th.col2').tooltip
            delay: 50
            animation: true
        @_reflow()
        $('.sortbyname').click @_sortByColumn
        $('.sortbyname[data-sort="'+@sortBy+'"]').click()
        $('tr[data-country]:first td[data-question-number="'+@sortBy+'"]').click()
        nav = @$el.find('#select-country')
        nav.chosen()
        nav.val(@alpha2).trigger('liszt:updated')
        nav.bind('change',@_onNavChange)
        navReg = @$el.find('#select-region')
        navReg.chosen()
        navReg.val('').trigger('liszt:updated')
        navReg.bind('change',@_onRegChange)

    ##################
    ## Private methods
    ##################
    _getQuestions: =>
        questions = []
        allQ = [114]
        allQ.push(n) for n in [119...134]
        for q in allQ
            data = _EXPLORER_DATASET.question[q+'']
            questions.push(data)
        return questions

    _calculateScore: (country) =>
        acc = 0
        count = 0
        for x in country['question']
            if parseFloat(x['score']) >= 0
                acc += parseFloat(x['score'])
                count++
        if (count==0) then return -1
        return Math.round(acc/count)

    _getCountry: =>
        countries = []
        allQ = [114]
        allQ.push(n) for n in [119...134]
        for ctry in @participation
            if ctry.alpha2 in @countriesIncluded
                data =
                    alpha2: ctry.alpha2
                    country: ctry.name
                    question: []
                obj = {}
                for q in allQ
                    obj =
                        number: q+''
                        score: ctry[q+'']['score']
                        letter: ctry[q+'']['letter']
                        comments: ctry[q+'']['comments']
                    data.question.push(obj)
                data.score = @_calculateScore(data)
                countries.push(data)
        return countries

    _sortByColumn: (e) =>
        e.preventDefault()
        target = $(e.delegateTarget)
        $('.sortbyname').removeClass 'active'
        target.addClass 'active'
        @sortBy = target.attr('data-sort')
        @_reflow()
        if @sortBy != 'name' and @sortBy != 'score'
            @$el.find('td[data-question-number="'+@sortBy+'"].letter').addClass('selected')
        return false

    _sorted: (a,b) =>
        for i in b['question']
            if i['number'] == @sortBy
                bScore = i['score']
        for j in a['question']
            if j['number'] == @sortBy
                aScore = j['score']
        x = bScore - aScore
        if not x
            return a.country.localeCompare b.country
        return x

    _reflow: =>
        tbody = $('#participation-table tbody')
        tbody.empty()
        data = @renderData['countries']
        if @sortBy == 'name'
            data.sort util.sortFunctionByName
        else if @sortBy == 'score'
            data.sort util.sortFunction
        else
            data.sort @_sorted
        tbody.append template_row @renderData
        $('#participation-table .letter').click @_onClickQuestion

    _boxHeight: (country) =>
        # set question and comments boxes height
        qtheight = $('.comments-box.' + country + ' .question .question-text').height()
        ctheight = $('.comments-box.' + country + ' .comments .comments-text').height()
        if qtheight > ctheight
            $('.comments-box.' + country + ' .comments .comments-text').height(qtheight)
        else
            $('.comments-box.' + country + ' .question .question-text').height(ctheight)
        qheight = $('.comments-box.' + country + ' .question').height()
        cheight = $('.comments-box.' + country + ' .comments').height()
        if qheight > cheight
            $('.comments-box.' + country + ' .comments').height(qheight)
        else
            $('.comments-box.' + country + ' .question').height(cheight)

    _completeAnswer: (country, number) =>
        q = _EXPLORER_DATASET.question[number]
        countries = @_getCountry()
        for obj in countries
            if obj['alpha2'] == country
                for elt in obj['question']
                    if elt['number'] == number
                        q['comments'] = elt['comments']
        return q

    _onClickQuestion: (e) =>
        target = $(e.delegateTarget)
        number = target.attr('data-question-number')
        country = target.parent('tr').attr('id')
        cbox = $('.comments-box.' + country)
        if @sortBy == number
            if target.hasClass 'active'
                target.removeClass 'active'
                target.addClass 'inactive'
                cbox.empty()
            else
                target.removeClass 'inactive'
                target.addClass 'active'
                q = @_completeAnswer(country, number)
                cbox.append(template_comments q)
                @_boxHeight(country)
        else
            $('.comments-box').empty()
            @$el.find('td.letter.active').removeClass('active').addClass('inactive')
            $('.sortbyname[data-sort="' + number + '"]').click()
            $('html, body').animate({
                scrollTop: $('#'+country).offset().top
            }, 500)
            target = $('tr[id="'+country+'"] td[data-question-number="'+number+'"]')
            target.removeClass 'inactive'
            target.addClass 'active'
            q = @_completeAnswer(country, number)
            cbox = $('.comments-box.' + country)
            cbox.append(template_comments q)
            @_boxHeight(country)

    _onNavChange: (e) =>
        value = $(e.delegateTarget).val()
        if value.length==2
            $('#'+value).css('background-color', 'rgba(84, 169, 84, 0.2)')
            $('html, body').animate({
                scrollTop: $('#'+value).offset().top
            }, 500)
            $('#'+value).animate({backgroundColor: 'rgba(255, 255, 255, 0.2)'}, 4000)
            $(e.delegateTarget).val('').trigger('liszt:updated')

    _onRegChange: (e) =>
        value = $(e.delegateTarget).val().replace('region-','')
        @region = value
        if not @region
            @region = '0'
        @countriesIncluded = []
        for contained in _EXPLORER_DATASET.regions[parseInt(@region)].contains
            @countriesIncluded.push(contained)
        @renderData =
            questions: @_getQuestions()
            countries: @_getCountry()
        @$el.html template_page @renderData
        $('th.col2').tooltip
            delay: 50
            animation: true
        @_reflow()
        $('.sortbyname').click @_sortByColumn
        $('.sortbyname[data-sort="'+@sortBy+'"]').click()
        nav = @$el.find('#select-country')
        nav.chosen()
        nav.val(@alpha2).trigger('liszt:updated')
        nav.bind('change',@_onNavChange)
        navReg = @$el.find('#select-region')
        navReg.chosen()
        navReg.val('region-' + @region).trigger('liszt:updated')
        navReg.bind('change',@_onRegChange)
