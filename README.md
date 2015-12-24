# koa-mount-html

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

 Catch-all mounting of koa apps and middleware for HTML GET requests.

## Installation

``` Shell
$ npm install koa-mount-html
```

## API

### Deferred fallback for all HTML requests
``` Javascript
const koa = require('koa');
const mountHtml = require('koa-mount-html');
const serve = require('koa-static');
const app = koa();

// with `defer: true`, koa-mount-html will only catch requests that are not
// answered by other middleware
app.use(mountHtml(function *sendHtml() {
  yield send(this, '/index.html', { root: __dirname + '/public' });
}, { defer: true }));

app.use(serve('public/static_pages'));
```

### Webpack dev middleware - html catch-all
``` Javascript
const koa = require('koa');
const mountHtml = require('koa-mount-html');
const webpackConfig = require('./webpack.conf');
const compiler = webpack(webpackConfig);
const publicPath = webpackConfig.output.publicPath;
const app = koa();

app.use(mountHtml(
    rewrite('/*', publicPath + '/index.html')
));

app.use(mount(
  publicPath, webpackDevMiddleware(compiler, serverOptions)
));
```

## Options

 - `defer` If true, serves after yield next, allowing any downstream middleware to respond first.
 - `includeDotPaths` If true, then paths including a dot (i.e. '/staticPage.html') will be cought as well.
