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
        
    onNavChange: (e) =>
        value = $(e.delegateTarget).val()
        if value.length==0
            window.location = '#profile'
        else
            assert value.length==2,'Invalid country code: '+value
            window.location = '#profile/'+value

    renderPage: (target) =>
        renderData =
          alpha2: @alpha2
          countries: _EXPLORER_DATASET.country
          data: @data
          dataJson: JSON.stringify @data
          empty: @alpha2==""
        @$el.html template_page renderData
        target.html @$el
        @_repaint()
        # Set up nav
        nav = @$el.find('.country-nav-select')
        nav.val @alpha2
        nav.bind('change',@onNavChange)


    ##################
    ## Private methods
    ##################
    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet) =>
      
