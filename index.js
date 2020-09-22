require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('handlebars')
const fs = require('fs')
const compression = require('compression')
const http = require('http')
const fork = require('child_process').fork
const cors = require('cors')

const app = express()
const server = http.createServer(app)

handlebars.registerPartial('include', (context) => {
  const file = `${__dirname}/views/inc/${context.path}.mustache`
  const html = fs.readFileSync(file).toString()
  const include = handlebars.compile(html)
  return include(context)
})

const configPath = `${__dirname}/config.json`

const stage = typeof process.argv[2] !== 'undefined' ? String(process.argv[2]) : 'development'
const production = stage === 'production'

if (production !== true) {
  app.use(cors())
}

app.use(bodyParser.json())

app.use(compression())
app.get('/', (req, res) => {
  let indexFilePath = `${__dirname}/public/index.min.html`
  fs.access(indexFilePath, (exists) => {
    if (exists && production) {
      res.sendFile(indexFilePath)
    } else {
      const config = loadConfig()

      indexFilePath = `${__dirname}/views/index.mustache`

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

if (production !== true) {
  const staticServer = express.static(`${__dirname}/static`)
  app.use(staticServer)
}
const publicServer = express.static(`${__dirname}/public`)
app.use(publicServer)

const mmApp = express.static(`${__dirname}/mm/dist`)
app.use('/mm', mmApp)

app.post('/mm', (req, res) => {
  const password = req.body.password
  console.log('LOGIN ATTEMPT', password, req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  if (password === process.env.MM_PASSWORD) {
    console.log('LOGIN SUCCESS')
    res.send(process.env.MM_KEY)
  } else {
    console.log('LOGIN FAILURE')
    res.sendStatus(401)
  }
})

app.post('/mmA', (req, res) => {
  if (req.headers.mm_key === process.env.MM_KEY) {
    res.json(JSON.parse(process.env.MM_CONTACTS))
  } else {
    res.sendStatus(401)
  }
})

app.get('/:page', (req, res) => {
  const pagePath = `${__dirname}/views/pages/${req.params.page}.mustache`
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
    console.log('starting production build ...')
    fork('./build.js', [JSON.stringify(loadConfig())])
  }
})

function loadConfig () {
  const configString = String(fs.readFileSync(configPath))
  const config = JSON.parse(configString)

  config.host = process.env.HOST ? process.env.HOST : (stage === 'production' ? 'shroomlife.de' : 'localhost')
  return config
}
