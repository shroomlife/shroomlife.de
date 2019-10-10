const fs = require("fs");
const jsdom = require("jsdom");
const compressor = require("node-minify");
const handlebars = require('handlebars');
const minify = require('html-minifier').minify;
const uuid = require("uuid/v1");
const buildId = uuid();

const path = require("path");

const dir = path.resolve(__dirname, "public");
console.log(`starting build in ${__dirname} => ${dir}`);

handlebars.registerPartial("include", (context) => {
	let file = `${dir}/views/inc/${context.path}.html`;
	let html = fs.readFileSync(file).toString();
	let include = handlebars.compile(html);
	return include(context);
});

fs.readFile(`${dir}/index.html`, (err, content) => {

	let config = JSON.parse(process.argv[2]);

	let indexHtml = String(content);
	let index = handlebars.compile(indexHtml);
	let html = index(config);

	let document = new jsdom.JSDOM(html, {});
	let window = document.window;

	require('jquery')(window);
	let jQuery = window.$;
	let tasks = [];

	// minify js
	let scriptsFile = `${dir}/static/app.min.js`;
	let scripts = [];

	jQuery('body script').each((index, script) => {

		script = jQuery(script);
		let src = script.attr('src');
		let srcPath = `${dir}/static/${src}`;

		if(fs.existsSync(srcPath)) {
			scripts.push(srcPath);
			script.remove();
		}
		
	});

	console.log("JS FILES", scripts);
	let jsMini = compressor.minify({
		"compressor": "uglify-es",
		"input": scripts,
		"output": scriptsFile,
	}).then(() => {
		console.log(`minified js to ${scriptsFile}`);
	}).catch((err) => {
		console.log("JS", err);
	});

	tasks.push(jsMini);

	// minify css
	let stylesFile = `${dir}/static/app.min.css`;
	let stylesheets = [];

	jQuery('head link[rel="stylesheet"]').each((index, style) => {

		style = jQuery(style);
		let href = style.attr("href");
		let stylePath = `${dir}/static/${href}`;

		if(fs.existsSync(stylePath)) {
			stylesheets.push(stylePath);
			style.remove();
		}

	});

	console.log("CSS FILES", stylesheets);
	let cssMini = compressor.minify({
		"compressor": "clean-css",
		"input": stylesheets,
		"output": stylesFile
	}).then(() => {
		console.log(`minified css to ${stylesFile}`);
	}).catch((err) => {
		console.log("CSS", err);
	});

	tasks.push(cssMini);

	// minify html
	Promise.all(tasks).then(() => {

		let scriptsContainer = jQuery("<script>");
		scriptsContainer.attr("async", "");
		scriptsContainer.appendTo(jQuery("body .scripts"));

		scriptsContainer.attr("src", `/app.min.js?v=${buildId}`);

		let styleContainer = jQuery("<link>");
		styleContainer.attr("rel", "stylesheet");
		styleContainer.attr("href", `/app.min.css?v=${buildId}`);

		jQuery("head").append(styleContainer);

		jQuery("img").each((index, img) => {

			img = jQuery(img);
			let source = img.attr("src");
			
			img.attr({
				"src": config.zero,
				"data-src": source
			});

			img.addClass("lazyload");

		});

		let finalHtml = window.document.documentElement.outerHTML;

		let minifiedHtml = minify(finalHtml, {
			"removeComments": true,
			"collapseWhitespace": true,
			"conservativeCollapse": true,
			"keepClosingSlash": true,
		});

		let newHtml = "<!doctype html><!-- version 08092019.1 -->" + minifiedHtml;

		fs.writeFileSync(`${dir}/views/index.min.html`, newHtml);
		console.log(`minified html to ${dir}/views/index.min.html`);

	}).catch((err) => {
		console.log(err);
	});

});
