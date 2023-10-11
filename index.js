require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('handlebars')
const fs = require('fs')
const compression = require('compression')
const http = require('http')
const cors = require('cors')
const path = require('path')
const { fork } = require('child_process')

const app = express()
const server = http.createServer(app)

handlebars.registerPartial('include', (context) => {
  const filePath = path.join(__dirname, '/views/inc/', `${context.path}.mustache`)
  const html = fs.readFileSync(filePath).toString()
  const include = handlebars.compile(html)
  return include(context)
})

const configPath = path.join(__dirname, '/config.json')

const stage = typeof process.argv[2] !== 'undefined' ? String(process.argv[2]) : 'development'
const production = stage === 'production'

if (production !== true) {
  app.use(cors())
}

app.use(bodyParser.json())

app.use(compression())
app.get('/', (req, res) => {
  console.log('__dirname', __dirname)
  let indexFilePath = path.join(__dirname, '/public/index.min.html')
  fs.access(indexFilePath, fs.constants.R_OK, (err) => {
    if (err) return console.error(err)
    if (production) {
      res.sendFile(indexFilePath)
    } else {
      const config = loadConfig()

      if (typeof config.skills !== 'undefined') {
        config.skills = config.skills.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      }

      indexFilePath = path.join(__dirname, '/views/index.mustache')

      fs.readFile(indexFilePath, (err, data) => {
        if (err) console.error(err)
        const indexHtml = String(data)
        const index = handlebars.compile(indexHtml)

        const html = index(config)
        res.type('html').send(html).end()
      })
    }
  })
})

const staticFolder = path.join(__dirname, '/static')
const staticServer = express.static(staticFolder)
app.use(staticServer)

const publicFolder = path.join(__dirname, '/public')
const publicServer = express.static(publicFolder)
app.use(publicServer)

const mmAppDistFolder = path.join(__dirname, '/mm/dist')
const mmApp = express.static(mmAppDistFolder)
app.use('/mm', mmApp)

app.post('/mm', (req, res) => {
  const password = req.body.password
  console.log('LOGIN ATTEMPT', password, req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  if (password === process.env.MM_PASSWORD) {
    console.log('LOGIN SUCCESS', process.env.MM_KEY)
    res.send(process.env.MM_KEY)
  } else {
    console.log('LOGIN FAILURE')
    res.sendStatus(401)
  }
})

app.get('/mmA', (req, res) => {
  if (req.headers['mm-key'] === process.env.MM_KEY) {
    res.json(JSON.parse(process.env.MM_CONTACTS))
  } else {
    res.sendStatus(401)
  }
})

app.get('/:page', (req, res) => {
  const pagePath = path.join(__dirname, '/views/pages/', `${req.params.page}.mustache`)
  fs.readFile(pagePath, (err, data) => {
    if (err) {
      res.status(404).end()
    } else {
      try {
        const pageHtml = String(data)
        const page = handlebars.compile(pageHtml)

        const config = loadConfig()

        config.page = req.params.page
        const html = page(config)

        res.type('html').send(html).end()
      } catch (error) {
        res.status(500).send(error.message)
      }
    }
  })
})

const listener = server.listen(80, () => {
  const address = listener.address()
  console.log(address)

  if (address.address === '::') {
    console.log(`app is listening at http://localhost:${address.port}`)
  } else {
    console.log(`app is listening at http://${address.address}:${address.port}`)
  }

  if (production) {
    try {
      console.log('starting production build ...')
      fork('./build.js', [JSON.stringify(loadConfig())])
    } catch (error) {
      console.error('Build Error: ', error)
    }
  }
})

function loadConfig () {
  const configString = String(fs.readFileSync(configPath))
  const config = JSON.parse(configString)

  config.currentYear = new Date().getFullYear()

  config.host = process.env.HOST ? process.env.HOST : (stage === 'production' ? 'shroomlife.de' : 'localhost')
  return config
}
