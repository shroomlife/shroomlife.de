const fs = require('fs')
const jsdom = require('jsdom')
const compressor = require('node-minify')
const handlebars = require('handlebars')
const minify = require('html-minifier').minify
const uuid = require('uuid/v1')
const buildId = uuid()

const path = require('path')

const dir = path.resolve(__dirname, 'public')
console.log(`starting build in ${__dirname} => ${dir}`)

handlebars.registerPartial('include', (context) => {
  const file = `${__dirname}/views/inc/${context.path}.html`
  const html = fs.readFileSync(file).toString()
  const include = handlebars.compile(html)
  return include(context)
})

fs.readFile(`${__dirname}/views/index.html`, (err, content) => {
  if (err) console.log(err)
  const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json')))

  if (typeof process.env.HOST !== 'undefined') {
    config.host = process.env.HOST
  }

  const indexHtml = String(content)
  const index = handlebars.compile(indexHtml)
  const html = index(config)

  const document = new jsdom.JSDOM(html, {})
  const window = document.window

  require('jquery')(window)
  const jQuery = window.$
  const tasks = []

  // minify js
  const scriptsFile = `${dir}/app.min.js`
  const scripts = []

  jQuery('body script').each((index, script) => {
    script = jQuery(script)
    const src = script.attr('src')
    const srcPath = `static/${src}`

    if (fs.existsSync(srcPath)) {
      scripts.push(srcPath)
      script.remove()
    }
  })

  console.log('JS FILES', scripts)
  const jsMini = compressor.minify({
    compressor: 'uglify-es',
    input: scripts,
    output: scriptsFile
  }).then(() => {
    console.log(`minified js to ${scriptsFile}`)
  }).catch((err) => {
    console.log('JS', err)
  })

  tasks.push(jsMini)

  // minify css
  const stylesFile = `${dir}/app.min.css`
  const stylesheets = []

  jQuery('head link[rel="stylesheet"]').each((index, style) => {
    style = jQuery(style)
    const href = style.attr('href')
    const stylePath = `static/${href}`

    if (fs.existsSync(stylePath)) {
      stylesheets.push(stylePath)
      style.remove()
    }
  })

  console.log('CSS FILES', stylesheets)
  const cssMini = compressor.minify({
    compressor: 'clean-css',
    input: stylesheets,
    output: stylesFile
  }).then(() => {
    console.log(`minified css to ${stylesFile}`)
  }).catch((err) => {
    console.log('CSS', err)
  })

  tasks.push(cssMini)

  // minify html
  Promise.all(tasks).then(() => {
    const scriptsContainer = jQuery('<script>')
    scriptsContainer.attr('async', '')
    scriptsContainer.appendTo(jQuery('body .scripts'))

    scriptsContainer.attr('src', `/app.min.js?v=${buildId}`)

    const styleContainer = jQuery('<link>')
    styleContainer.attr('rel', 'stylesheet')
    styleContainer.attr('href', `/app.min.css?v=${buildId}`)

    jQuery('head').append(styleContainer)

    jQuery('img').each((index, img) => {
      img = jQuery(img)
      const source = img.attr('src')

      img.attr({
        src: config.zero,
        'data-src': source
      })

      img.addClass('lazyload')
    })

    const finalHtml = window.document.documentElement.outerHTML

    const minifiedHtml = minify(finalHtml, {
      removeComments: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      keepClosingSlash: true
    })

    const newHtml = '<!doctype html>' + minifiedHtml + '<!-- update 23/03/2020 -->'

    fs.writeFileSync(`${dir}/index.min.html`, newHtml)
    console.log(`minified html to ${dir}/index.min.html`)
  }).catch((err) => {
    console.log(err)
  })
})
