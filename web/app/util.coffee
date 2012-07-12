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

