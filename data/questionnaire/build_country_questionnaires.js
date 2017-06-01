const path = require('path')

require('dotenv').config({ silent: true })
const _ = require('underscore')
const Excel = require('exceljs')
const slug = require('slug-component')
const request = require('request')
// Import helpers to make them available to templates
const helpers = require('handlebars-helpers')() // eslint-disable-line no-unused-vars
const linkifyStr = require('linkifyjs/string')
const Handlebars = require('handlebars')
const argv = require('yargs').argv

const Metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const jsonToFiles = require('metalsmith-json-to-files')

const QUESTION_ID_COL = 'A'
const QUESTION_COL = 'B'
const QUESITON_TYPE_COL = 'C'
const LABEL_OPTIONS_COL = 'D'
const SCORE_COL = 'E'
const CRITERIA_COL = 'F'
const DATA_ELEMENTS_COL = 'H'
const COUNTRY_START_COL = 'I'

const DEVELOPMENT_MODE = argv.dev !== undefined
const QUESTIONNAIRE_SPREADSHEET_ID = process.env.QUESTIONNAIRE_SPREADSHEET_ID
if (QUESTIONNAIRE_SPREADSHEET_ID === undefined) {
  throw new Error('The env var "QUESTIONNAIRE_SPREADSHEET_ID" must be set.')
}
const QUESTIONNAIRE_SPREADSHEET_URL
  = `https://docs.google.com/spreadsheets/d/${QUESTIONNAIRE_SPREADSHEET_ID}/export?format=csv`


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
    if (cell.value !== '' && cell.value !== null) {
      qStarts.push(rowNumber)
    }
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
    'question': <col 2>,
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

  {
    name: <country name>,
    slug: <country name slug,
    answers: [
      {
        qid: <question id>,
        author: {
          score: ,
          answerLabel: ,
          comments: ,
          scoreOptions: ,
          sourceDescription:
        },
        reviews: [
          {
            reviewer: ,
            opinion: ,
            suggestedScore: ,
            comments: ,
            peerReviewDiscussions:
          },
          [...]
        ]
      }
    ]
  }
  */

  /* eslint-disable quote-props */
  const authorElements = {
    'Score': 'score'
    , 'Answer Label': 'answerLabel'
    , 'Author Comments': 'comments'
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
  const linkifyOptions = {
    format(value, type) {
      const maxUrlLength = 60
      // value is the link, type is 'url', 'email', etc.
      if (type === 'url' && value.length > maxUrlLength) {
        return `${value.slice(0, maxUrlLength)}…`
      }
      return value
    }
  }

  const country = {}
  country.name = ws.getCell(1, countryColNum).value
  country.slug = slug(country.name)
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
        let elementValue = ws.getCell(r, countryColNum).value
        if (_.isString(elementValue)) {
          elementValue = new Handlebars.SafeString(linkifyStr(elementValue, linkifyOptions))
        }
        answer.author[authorElements[elementName]] = elementValue || null
      } else if (_.contains(_.keys(reviewElements), elementName)) {
        let elementValue = ws.getCell(r, countryColNum).value || null
        if (elementName === 'Reviewer') {
          currentReviewerIndex += 1
          answer.reviews.push({})
        }
        if (_.isString(elementValue)) {
          elementValue = new Handlebars.SafeString(linkifyStr(elementValue, linkifyOptions))
        }
        answer.reviews[currentReviewerIndex][reviewElements[elementName]] = elementValue
      }
    })
    country.answers.push(answer)
  })

  return country
}

function buildCountryPages(questions, countries) {
  /*
  Use Metalsmith to build the country pages.
  */
  const templatePath = path.join(__dirname, './views/')
  const baseUrl = '/questionnaires/'

  Metalsmith(__dirname) // eslint-disable-line new-cap
  .metadata({
    currentTime: Date.now()
    , questions
    , countries
    , baseUrl
  })
  .source('./src')
  .destination('../../_build-questionnaires')
  .clean(true)
  .use(jsonToFiles({ use_metadata: true }))
  .use(layouts({
    engine: 'handlebars'
    , directory: templatePath
  }))
  .build((err) => {
    if (err) throw err
  })
}

/*
  The main bit.

  Read the questionnaire spreadsheet and create `question` and `country`
  objects from the data. Use these to populate html templates for each country.
*/
const fileRequest = request.get(QUESTIONNAIRE_SPREADSHEET_URL)
.on('response', response => {
  if (response.statusCode !== 200) {
    throw new Error('Error retrieving Questionnaire CSV. Response status is not 200')
  }
})
.on('error', err => {
  console.log(err)
})

const workbook = new Excel.Workbook()
workbook.csv.read(fileRequest)
.then((ws) => {
  const qRowRanges = getQuestionRowRanges(ws)

  const questions = []
  _.each(qRowRanges, rowRange => {
    questions.push(makeQuestionFromRowRange(ws, rowRange))
  })

  const countryColStart = ws.getColumn(COUNTRY_START_COL).number
  let countryColEnd = ws.columnCount
  if (DEVELOPMENT_MODE) {
    countryColEnd = countryColStart + 10
  }
  const countryColRange = [countryColStart, countryColEnd]
  const countries = []
  _.each(_.range(countryColRange[0], countryColRange[1] + 1), countryColNum => {
    if (ws.getCell(1, countryColNum).value !== null) {
      countries.push(makeCountryAnswersFromQuestions(ws, countryColNum, questions))
    }
  })

  buildCountryPages(questions, countries)
})
.catch(err => {
  console.error(err.stack)
})
