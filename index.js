const express = require('express');
const handlebars = require('handlebars');
const fs = require('fs');
const compression = require('compression');
const http = require('http');
const fork = require('child_process').fork;

const app = express();
const server = http.createServer(app);

const static = express.static(`${__dirname}/static`);

handlebars.registerPartial("include", (context) => {
	let file = `${__dirname}/views/inc/${context.path}.html`;
	let html = fs.readFileSync(file).toString();
	let include = handlebars.compile(html);
	return include(context);
});

const configPath = `${__dirname}/config.json`;

const stage = typeof process.argv[2] !== 'undefined' ? String(process.argv[2]) : "development";
const production = stage === "production" ? true : false;

app.use(compression());
app.get('/', (req, res) => {

	let indexFilePath = `${__dirname}/public/index.min.html`;
	fs.exists(indexFilePath, (exists) => {

		if (exists && production) {
			res.sendFile(indexFilePath);
		} else {

			let config = loadConfig();

			indexFilePath = `${__dirname}/views/index.html`;

			fs.readFile(indexFilePath, (err, data) => {

				let indexHtml = String(data);
				let index = handlebars.compile(indexHtml);

				let html = index(config);
				res.type('html').send(html).end();

			});

		}

	});

});

app.use(static);
app.get('/:page', (req, res) => {

	let pagePath = `${__dirname}/views/pages/${req.params.page}.html`;
	fs.readFile(pagePath, (err, data) => {

		if (err) {
			res.status(404).end();
		} else {

			try {
				let pageHtml = String(data);
				let page = handlebars.compile(pageHtml);

				let config = loadConfig();

				config.page = req.params.page;
				let html = page(config);

				res.type('html').send(html).end();

			} catch (error) {
				res.status(500).send(error.message);
			}


		}

	});

});

let listener = server.listen(80, () => {

	let address = listener.address();
	console.log(`app is listening at ${address.port}`);

	if (production) {
		console.log("starting production build ...");
		fork("./build.js", [JSON.stringify(loadConfig())]);
	}

});

function loadConfig() {

  configString = String(fs.readFileSync(configPath));
  let config = JSON.parse(configString);
  
	config.host = (stage === "production" ? "shroomlife.de" : "localhost");
	return config;

}