template_page = require 'views/templates/page/rawdata'

module.exports = class ProjectPage extends Backbone.View
    clickExpand: (e) ->
        e.preventDefault()
        $(e.currentTarget).parents('.text').first().trigger 'destroy'
        return false

    renderPage: (target) =>
        renderData = 
            country: _EXPLORER_DATASET.country
            groupings: _EXPLORER_DATASET.groupings
            question: []
        for qnum, qdata of _EXPLORER_DATASET.question
            q = _.extend {
                in_index: _EXPLORER_DATASET.questions_in_index.contains parseInt(qnum)
            }, qdata
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
