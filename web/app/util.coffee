application = require('application')

module.exports = 
  answerDict: (row, answerIndex) ->
    letter = row['l'+answerIndex]
    letter_processed = letter.toUpperCase()
    if letter_processed=='E'
      letter_processed = 'n/a'
    number = row['n'+answerIndex]
    letter: letter
    letter_processed: letter_processed
    render_pie_chart: number>=0
    number: number

  stringToUrl: (s) ->
    s = s.replace(/\([^\)]*\)/g, '')
    s = $.trim(s)
    s = s.replace(/[^\w ]+/g,'')
    s = s.replace(/\s+/g,'-')
    s = s.toLowerCase()
    s

  answerComparator: (a,b) ->
    if a.answer.letter > b.answer.letter 
      return 1
    if a.answer.letter < b.answer.letter
      return -1
    return a.id - b.id

