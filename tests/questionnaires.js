const Browser = require('zombie')

describe('User visits questionnaire page', () => {
  describe('authenticated', () => {
    const browser = new Browser()
    browser.proxy = 'http://localhost:3000'

    before(done => {
      const [basicUserName, basicUserPass] = process.env.QUESTIONNAIRE_AUTH.split(':')
      browser.on('authenticate', authentication => {
        authentication.username = basicUserName
        authentication.password = basicUserPass
      })
      browser.visit('/questionnaires', done)
    })

    it('should be successful', () => {
      browser.assert.success()
    })

    it('should have country dropdown', () =>{
      browser.assert.element('.country-nav-select')
      browser.assert.elements('.country-nav-select option', 12)
    })
  })

  describe('unauthenticated', () => {
    const browser = new Browser()
    browser.proxy = 'http://localhost:3000'

    describe('without credentials', () => {
      it('should return status code 401', (done) => {
        browser.visit('/questionnaires', () => {
          browser.assert.status(401)
          done()
        })
      })
    })

    describe('wrong credentials', () => {
      it('should return status code 401', (done) => {
        browser.on('authenticate', authentication => {
          authentication.username = 'wronguser'
          authentication.password = 'wrongpass'
        })
        browser.visit('/questionnaires', () => {
          browser.assert.status(401)
          done()
        })
      })
    })
  })
})
