const debug = require('debug')('koa-mount-html');
const compose = require('koa-compose');

const assert = require('assert');
const path = require('path');
const url = require('url');

const CONTENT_TYPE_HTML = 'text/html';

function acceptsHtml (acceptsString) {
  return acceptsString.indexOf('application/json') !== 0
         && (acceptsString.indexOf('text/html') !== -1 || acceptsString.indexOf('*/*') !== -1)
}

function *noop(){}

exports = module.exports = function mountHtml(app, opts) {
  opts = opts || {};

  const downstream = app.middleware
    ? compose(app.middleware)
    : app;

  assert(downstream, 'koa app / middleware required');

  return function* (upstream) {

    if (opts.defer) {
      yield* upstream;
      // response is already handled
      if (this.body != null || this.status != 404) return;
    }

    if (this.method === 'GET' && this.accepts('text/html')) {

      const parsedUrl = url.parse(this.url);

      if (opts.includeDotPaths || parsedUrl.pathname.indexOf('.') === -1) {

        debug('mounting for url "%s"', this.url);

        if (opts.defer) {
          yield* downstream.call(this, noop());
        }
        else {
          yield* downstream.call(this, function * callback(){
            yield* upstream;
          }.call(this));
        }

      }
      else {
        debug('not mounting request for a path containing a \'.\' "%s"', parsedUrl.pathname);
      }

    }

    yield *upstream;
  };
};
