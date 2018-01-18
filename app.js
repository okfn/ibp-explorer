const fs = require('fs')
const path = require('path')
const express = require('express')
const swig = require('swig')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const moment = require('moment')
const _ = require('underscore')
const i18n = require('i18n-abide')
const api = require('./api')
const basicAuth = require('express-basic-auth')

const locales = _.without(fs.readdirSync(path.join(__dirname, 'tracker', '/i18n')), 'templates')
const routes = require('./routes/index')
const manifest = require('./tracker/build/manifest.json')

const app = express()

// view engine setup
app.engine('html', swig.renderFile)
app.set('views', path.join(__dirname, '/tracker/views'))
app.set('view engine', 'html')
app.set('view cache', false)
swig.setDefaults({ cache: false })

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(express.static(path.join(__dirname, 'tracker')))
app.use(cookieParser())

// OK setup translation
app.use(i18n.abide({
  default_lang: 'en',
  supported_languages: locales,
  translation_directory: 'tracker/i18n'
}))

// Override moment fallback so dates are not converted
// because partial dates like "June 2015" fallback to "1 June 2015"
moment.createFromInputFallback = function (config) {
  config._d = new Date(NaN)
}

swig.setFilter('formatDate', input => {
  const date = moment(input)
  if (date.isValid()) {
    return moment(input).format('D MMMM YYYY')
  } else if (typeof input === 'string') {
    if (input.toLowerCase().trim() === 'n/a' || input.toLowerCase().trim() === '\"n/a\"') {
      return '-'
    } else if (input.length > 25) {
      return '-'
    // If there aren't any digits present in the string it's probably not a
    // date but some description
    } else if (!/\d/.test(input)) {
      return '-'
    }

    return input
  }

  return '-'
})

swig.setFilter('orderYears', input => {
  /*
  Take an input list of years and order them. Can handle items like 'December
  2016' by changing them to '2016-12'.
  */

  const orderableYear = ym => {
    /*
    Take a ym like 'December 2016', and return it as a year-mm, like 2016-12.
    */
    const months = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '14',
      November: '11',
      December: '12'
    }
    const splitYear = ym.split(' ')
    if (splitYear.length === 2) {
      return `${splitYear[1]}-${months[splitYear[0]]}`
    }
    return ym
  }
  let ordered = _.map(input, (y, k) => orderableYear(k))
  ordered = ordered.sort().reverse()
  return ordered
})

app.use(function (req, res, next) {
  if (req.query.locale) {
    req.setLocale(req.query.locale)
    moment.locale(req.query.locale)
    res.cookie('obstracker_language', req.query.locale, { maxAge: 900000 })
  } else if (req.cookies.obstracker_language) {
    req.setLocale(req.cookies.obstracker_language)
    moment.locale(req.cookies.obstracker_language)
  } else {
    req.setLocale('en')
    moment.locale('en')
  }
  res.locals.asset = function (file) {
    if (app.get('env') === 'development') {
      return file
    }
    const index = file.substr(file.lastIndexOf('/') + 1)
    if (typeof manifest[index] === 'string') {
      file = '/build' + file.replace(index, manifest[index])
    }
    return file
  }
  res.locals.i18nformat = req.format
  res.locals.date_format = function (date, format) {
    const parsedDate = moment(date)
    if (parsedDate.isValid()) {
      return parsedDate.format(format)
    } else if (typeof date === 'object' && 'year' in date) {
      const splitYears = date.year.split('/')
      const formatted = []
      for (var idx in splitYears) {
        formatted.push(res.locals.date_format(splitYears[idx], format))
      }
      return formatted.join('/')
    }
    return date
  }
  res.locals.isString = function (object) {
    return (typeof object === 'string')
  }
  res.locals.isObject = function (object) {
    return (typeof object === 'object')
  }
  next()
})

// Now routes...
app.use('/', express.static('./_build'))
app.use('/availability', routes)
app.get('/search_data', function (req, res) {
  api.getSearch().then(function (search) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(search))
  }).catch(function (err) {
    console.log(err)
  })
})


// Set up basic auth for the Questionnaires pages using creds from env var.
const [basicUserName, basicUserPass] = process.env.QUESTIONNAIRE_AUTH.split(':')
const basicUserAuthObj = {
  users: {},
  challenge: true,
  realm: 'Questionnaires'
}
basicUserAuthObj.users[basicUserName] = basicUserPass
const basicUserAuth = basicAuth(basicUserAuthObj)
app.use('/questionnaires', basicUserAuth, express.static('./_build-questionnaires'))


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error_embed', {
      status: err.status,
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error_embed', {
    status: err.status,
    message: err.message,
    error: {}
  })
})

module.exports = app
