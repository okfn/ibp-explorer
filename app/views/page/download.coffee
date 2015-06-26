template_page = require 'views/templates/page/download'

reportGenerator = require 'views/reportgenerator'

module.exports = class DownloadPage extends Backbone.View
    initialize: =>
        reportGenerator.bind 'update', @_repaint

    tx: -> $('#custom-csv')

    renderPage: (target) =>
        collapsed = false
        if $('#accordion2 .accordion-toggle').hasClass 'collapsed'
            collapsed = true
        @year = '2015'
        reportGenerator.update(@year, collapsed)
        @$el.html template_page _EXPLORER_DATASET
        target.html @$el
        @_repaint()
        @tx().bind( 'click', => @tx().select() )
        $('input[name="downloadyear"]').bind('change', @changeyear)
        # Create downloadify options
        options = 
            filename: -> 'custom-budget-report.csv'
            data: => $('#custom-csv').val()
            onComplete: -> alert('Your File Has Been Saved!')
            onCancel: -> null
            onError: -> null
            swf: 'downloadify.swf'
            downloadImage: 'images/download.png'
            width: 100
            height: 30
            transparent: true
            append: false
        Downloadify.create 'downloadify',options
    
    changeyear: (e) =>
        target = $(e.delegateTarget)
        lastYear = @year
        currentYear = target.attr('value')
        newReport = (lastYear == '2015' || currentYear == '2015')
        @year = target.attr('value')
        if @year == 'all'
            @year = '2006'
        if newReport
            collapsed = false
            if $('#accordion2 .accordion-toggle').hasClass 'collapsed'
                collapsed = true
            reportGenerator.update(@year, collapsed)
        @_repaint()

    _writeLine: (out, x) -> 
        # Simple CSV escaping which rejects strings containing "
        for index in [0...x.length]
            element = x[index] or ''
            assert not ('"' in element), 'Cannot encode string: '+element
            if ',' in element
                x[index] = '"' + element + '"'
        out.push x.join(',')

    _csvQuestions: (questionSet) ->
        # Prep
        out = []
        # Headers
        headers = ['NUMBER','TEXT','A','B','C','D','E']
        @_writeLine out, headers
        # Content
        q = _EXPLORER_DATASET.question
        for x in questionSet
            @_writeLine out, [ x, q[x].text, q[x].a, q[x].b, q[x].c, q[x].d, q[x].e ]
        # Complete
        return out


    # Note that this is code duplicated from profile.coffee. 
    # Forgive me, time is running short and we need this working.
    # A better fix should be thought up!
    _number_to_letter: (value) ->
        """The given letters in the source data arent always there. 
          'q102l' does not exist while 'q102' does.
          Therefore it is safer to use this technique to extract a letter..."""
        assert value in [-1,0,33,67,100], 'Invalid value: '+value
        return {
          '-1': 'e'
          0: 'd'
          33: 'c'
          67: 'b'
          100: 'a'
        }[value]

    _csvAnswers: (dataset,region,questionSet) ->
        if @year != '2015'
            datasetRegions = _EXPLORER_DATASET.regions_old
            datasetCountry = _EXPLORER_DATASET.country_old
            all_years = ['2006','2008','2010','2012']
        else
            datasetRegions = _EXPLORER_DATASET.regions
            datasetCountry = _EXPLORER_DATASET.country
            all_years = ['2015']
        out = []
        headers = ['COUNTRY', 'COUNTRY_NAME', 'YEAR', 'SCORE']
        for x in questionSet
            headers.push x.toString()
        for x in questionSet
            headers.push x+'l'
        @_writeLine out, headers
        # Quickly lookup country data
        tmp = {}
        for x in datasetCountry
            tmp[x.alpha2] = x
        # Compile a CSV in the browser
        selected_countries = []
        for reg in region
            for contained in datasetRegions[reg].contains
                selected_countries.push(contained)
        for country in dataset
            if country.alpha2 not in selected_countries then continue
            selected_year = $('input[name="downloadyear"]:checked').val()
            if not (selected_year in all_years) 
                selected_year = all_years
            else
	            selected_year = [selected_year]
            for year in selected_year
                if year not of country then continue
                row = [country.alpha2, country.country, year, country[year]]
                for q in questionSet
                    row.push tmp[country.alpha2]['db_'+year][q]
                for q in questionSet
                    value = tmp[country.alpha2]['db_'+year][q]
                    row.push @_number_to_letter(value)
                assert row.length==headers.length
                @_writeLine out, row
        return out

    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) =>
        #@tx().html (@_csvQuestions questionSet).join('\n')
        @tx().html (@_csvAnswers dataset,region,questionSet).join('\n')
