const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT || 8000

function serveFile (relativePath) {
  return function (req, res) {
    res.sendFile(path.join(__dirname, '..', relativePath))
  }
}

app.get('/', serveFile('index.html'))
app.get('/litewrite.min.js', serveFile('litewrite.min.js'))
app.get('/service-worker.js', serveFile('service-worker.js'))

app.use('/img', express.static(path.join(__dirname, '../img')))
app.use('/style', express.static(path.join(__dirname, '../style')))

if (require.main === module) {
  app.listen(port, function (error) {
    if (error) {
      console.error(error)
    } else {
      console.info('==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port)
    }
  })
}

module.exports = app
