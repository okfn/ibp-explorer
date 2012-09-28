template_page = require 'views/templates/page/query'

module.exports = class ProjectPage extends Backbone.View
    clickExpand: (e) ->
        e.preventDefault()
        $(e.currentTarget).parents('.text').first().trigger 'destroy'
        return false

    groups_flat: ->
        out = []

    renderPage: (target) =>
        groups = _EXPLORER_DATASET.groupings
        groups_flat = []
        id = 0
        for x in groups
            for y in x.entries
                groups_flat.push y
                y.group_id = id++
        renderData = 
            country: _EXPLORER_DATASET.country
            groupings: groups
            question: []
        id = 0
        for qnum, qdata of _EXPLORER_DATASET.question
            qnum = parseInt(qnum)
            q = _.extend {
                in_index: _EXPLORER_DATASET.questions_in_index.contains qnum
                groups: []
            }, qdata
            # Tag the question with a list of parent groups
            for x in groups_flat
                if x.qs.contains qnum
                    q.groups.push ('group-'+x.group_id)
            renderData.question.push q
        # Write to DOM
        @$el.html template_page renderData
        target.html @$el

        # Bind to DOM
        $('.question .text').each (i,el) =>
            el = $(el)
            el.dotdotdot {
                height: 60
                after: 'a.expand'
                ellipsis: '  '
                callback: (isTruncated) =>
                    expandLink = el.find('a.expand')
                    if isTruncated
                        expandLink.click @clickExpand
                    else
                        expandLink.remove()
            }
            el.bind 'destroy', (e) -> el.find('a.expand').remove()
        question_toggles = $('.question-toggles')
        $('.group-toggler').bind 'mouseover', (e) =>
            el = $(e.srcElement)
            group = el.attr('id')
            question_toggles.find('.'+group).addClass 'hover'
        $('.group-toggler').bind 'mouseout', (e) =>
            question_toggles.find('.toggle').removeClass 'hover'
        $('.group-toggler').bind 'click', (e) => e.preventDefault(); return false


