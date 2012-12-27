template_page = require 'views/templates/page/download'

reportGenerator = require 'views/reportgenerator'

module.exports = class DownloadPage extends Backbone.View
    initialize: =>
        reportGenerator.bind 'update', @_repaint

    tx: -> $('#custom-csv')

    renderPage: (target) =>
        @$el.html template_page _EXPLORER_DATASET
        target.html @$el
        @_repaint()
        @tx().bind( 'click', => @tx().select() )
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
        out = []
        headers = ['COUNTRY', 'COUNTRY_NAME', 'YEAR', 'SCORE']
        for x in questionSet
            headers.push x.toString()
        for x in questionSet
            headers.push x+'l'
        @_writeLine out, headers
        # Quickly lookup country data
        tmp = {}
        for x in _EXPLORER_DATASET.country
            tmp[x.alpha2] = x
        # Compile a CSV in the browser
        for country in dataset
            if country.alpha2 not in _EXPLORER_DATASET.regions[region].contains then continue
            for year in ['2006','2008','2010','2012']
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
