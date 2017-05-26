const _ = require('underscore')
const path = require('path')
const Excel = require('exceljs')

const Metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')

const questionnaireXLSFileName = 'SAMPLE--OBS_2015data.xlsx'
const questionnaireXLSFilePath = path.join(__dirname, questionnaireXLSFileName)

const QUESTION_ID_COL = 'A'
const QUESTION_COL = 'B'
const QUESITON_TYPE_COL = 'C'
const LABEL_OPTIONS_COL = 'D'
const SCORE_COL = 'E'
const CRITERIA_COL = 'F'
const DATA_ELEMENTS_COL = 'G'
const COUNTRY_START_COL = 'H'


function getQuestionRowRanges(ws) {
  /*
  Return an array of [start, end] values, representing the start row and end
  row for each question in the passed worksheet.
  */

  // Get the QID column:
  const idCol = ws.getColumn(QUESTION_ID_COL)

  // Get the row number range for each question
  const qStarts = []
  idCol.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    qStarts.push(rowNumber)
  })
  const qEnds = []
  _.each(qStarts, (s, k) => {
    if (k !== 0) qEnds.push(s - 1)
  })
  // Add the last row to the ends array
  qEnds.push(ws.rowCount)

  // A collection of row ranges representing the questions
  const qRowRanges = _.zip(qStarts, qEnds)
  // Remove the first element (the header)
  qRowRanges.shift()

  return qRowRanges
}

function makeQuestionFromRowRange(ws, range) {
  /* Make a question object from the worksheet and row range.

  {
    'qid': <col 1>,
    'questions': <col 2>,
    'type': <col 3>,
    'scoreOptions': [
      {
        'label_option': 'a.',
        'score': 100.0,
        'criteria': 'Yes, administrative units accounting for all expenditures are presented.'
      },
      [...]
    ]
  }
  */

  const q = {}
  q.qid = ws.getCell(`${QUESTION_ID_COL}${range[0]}`).value
  q.rowRange = range
  q.question = ws.getCell(`${QUESTION_COL}${range[0]}`).value
  q.type = ws.getCell(`${QUESITON_TYPE_COL}${range[0]}`).value

  q.scoreOptions = []
  _.each(_.range(range[0], range[1] + 1), r => {
    const c = ws.getCell(`${LABEL_OPTIONS_COL}${r}`)
    if (c.value !== null) {
      const scoreOptions = {}
      scoreOptions.label_option = c.value
      scoreOptions.score = ws.getCell(`${SCORE_COL}${r}`).value
      scoreOptions.criteria = ws.getCell(`${CRITERIA_COL}${r}`).value
      q.scoreOptions.push(scoreOptions)
    }
  })
  return q
}

function makeCountryAnswersFromQuestions(ws, countryColNum, questions) {
  /*
    For each countryColNum, make a collection of question answers and reviews.
  */

  /* eslint-disable quote-props */
  const authorElements = {
    'Score': 'score'
    , 'Answer Label': 'answerLabel'
    , 'Author Comments': 'authorComments'
    , 'Source Options': 'sourceOptions'
    , 'Source Description': 'sourceDescription'
  }
  const reviewElements = {
    'Reviewer': 'reviewer'
    , 'Opinion': 'opinion'
    , 'Suggested Score': 'suggestedScore'
    , 'Comments': 'comments'
    , 'Peer Review Discussions': 'peerReviewDiscussions'
  }
  /* eslint-enable quote-props */

  const country = {}
  country.name = ws.getCell(1, countryColNum).value
  country.answers = []
  _.each(questions, q => {
    const answer = {}
    answer.qid = q.qid

    answer.author = {}
    answer.reviews = []
    const dataElementsColNum = ws.getColumn(DATA_ELEMENTS_COL).number
    let currentReviewerIndex = -1
    _.each(_.range(q.rowRange[0], q.rowRange[1] + 1), r => {
      const elementName = ws.getCell(r, dataElementsColNum).value
      if (_.contains(_.keys(authorElements), elementName)) {
        const elementValue = ws.getCell(r, countryColNum).value
        answer.author[authorElements[elementName]] = elementValue || null
      } else if (_.contains(_.keys(reviewElements), elementName)) {
        const elementValue = ws.getCell(r, countryColNum).value || null
        if (elementName === 'Reviewer') {
          currentReviewerIndex += 1
          answer.reviews.push({})
        } else {
          answer.reviews[currentReviewerIndex][reviewElements[elementName]] = elementValue
        }
      }
    })
    country.answers.push(answer)
  })

  return country
}

/*
  The main bit.

  Read the questionnaire spreadsheet and create `question` and `country`
  objects from the data. Use these to populate html templates for each country.
*/
const workbook = new Excel.Workbook()
workbook.xlsx.readFile(questionnaireXLSFilePath)
.then((wb) => {
  // Get the worksheet (first ws)
  const ws = wb.getWorksheet(1)

  const qRowRanges = getQuestionRowRanges(ws)

  const questions = []
  _.each(qRowRanges, rowRange => {
    questions.push(makeQuestionFromRowRange(ws, rowRange))
  })

  const countryColRange = [ws.getColumn(COUNTRY_START_COL).number, ws.columnCount]
  const countries = []
  _.each(_.range(countryColRange[0], countryColRange[1] + 1), countryColNum => {
    countries.push(makeCountryAnswersFromQuestions(ws, countryColNum, questions))
  })

})
.catch(err => {
  console.error(err.stack)
})
