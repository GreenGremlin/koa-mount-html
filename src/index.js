const debug = require('debug')('koa-mount');
const compose = require('koa-compose');

const url = require('url');

const CONTENT_TYPE_HTML = 'text/html';

// function* rewriteIndex(next) {
//   if (this.accepts().toString().substr(0, CONTENT_TYPE_HTML.length) === CONTENT_TYPE_HTML) {
//     this.request.url = '/index.html';
//   }
//   yield *next;
// }


// function evaluateRewriteRule(parsedUrl, match, rule) {
//   if (typeof rule === 'string') {
//     return rule;
//   }
//   else if (typeof rule !== 'function') {
//     throw new Error('Rewrite rule can only be of type string of function.');
//   }

//   return rule({
//     parsedUrl: parsedUrl,
//     match: match
//   });
// }

function acceptsHtml(header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

// function getLogger(options) {
//   if (options && options.logger) {
//     return options.logger;
//   }
//   else if (options && options.verbose) {
//     return console.log.bind(console);
//   }
//   return () => {};
// }

exports = module.exports = function historyApiFallback(app, _options) {
  const options = _options || {};
  // const logger = getLogger(options);

  // compose
  const downstream = app.middleware
    ? compose(app.middleware)
    : app;

  // const name = app.name || 'unnamed';
  // debug('mount %s %s', prefix, name);

  // return function *(upstream){
  //   var prev = this.path;
  //   var newPath = match(prev);
  //   debug('mount %s %s -> %s', prefix, name, newPath);
  //   if (!newPath) return yield* upstream;

  //   this.mountPath = prefix;
  //   this.path = newPath;
  //   debug('enter %s -> %s', prev, this.path);

  //   yield* downstream.call(this, function *(){
  //     this.path = prev;
  //     yield* upstream;
  //     this.path = newPath;
  //   }.call(this));

  //   debug('leave %s -> %s', prev, this.path);
  //   this.path = prev;
  // }

  // return function(req, res, next) {
  return function* (upstream) {
    // var headers = req.headers;
    const accepts = this.accepts().toString();
    // let reason = '';
    let parsedUrl;
    // let rewriteTarget;
    // let rewrites;
    // let rewritten;

    // if (this.request.method !== 'GET') {
    //   reason = 'because the method is not GET.';
    // }
    // else if (!accepts || typeof accepts !== 'string') {
    //   reason = 'because the client did not send an HTTP accept header.';
    // }
    // else if (accepts.indexOf('application/json') === 0) {
    //   reason = 'because the client prefers JSON.';
    // }
    // else if (!acceptsHtml(accepts)) {
    //   reason = 'because the client does not accept HTML.';
    // }
    // else {

    if (this.request.method === 'GET'
        && accepts && typeof accepts === 'string'
        && accepts.indexOf('application/json') !== 0
        && acceptsHtml(accepts)) {

      parsedUrl = url.parse(this.request.url);
      // rewrites = options.rewrites || [];

      // rewritten = rewrites.some(rewrite => {
      //   const match = parsedUrl.pathname.match(rewrite.from);

      //   if (match !== null) {
      //     yield* downstream.call(this, function *(){
      //       yield* upstream;
      //     }.call(this));
      //   }
      // });
      // if (rewritten) {
      //   yield *upstream;
      // }

      if (parsedUrl.pathname.indexOf('.') === -1) {
        yield* downstream.call(this, function *(){
          yield* upstream;
        }.call(this));
      }
      // else {
      //   reason = 'because the path includes a dot (.) character.';
      // }
    }

    yield *upstream;
  };
};
