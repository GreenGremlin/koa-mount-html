const CONTENT_TYPE_HTML = 'text/html';

function* rewriteIndex(next) {
  if (this.accepts().toString().substr(0, CONTENT_TYPE_HTML.length) === CONTENT_TYPE_HTML) {
    this.request.url = '/index.html';
  }
  yield *next;
}

const url = require('url');

function evaluateRewriteRule(parsedUrl, match, rule) {
  if (typeof rule === 'string') {
    return rule;
  }
  else if (typeof rule !== 'function') {
    throw new Error('Rewrite rule can only be of type string of function.');
  }

  return rule({
    parsedUrl: parsedUrl,
    match: match
  });
}

function acceptsHtml(header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

function getLogger(options) {
  if (options && options.logger) {
    return options.logger;
  }
  else if (options && options.verbose) {
    return console.log.bind(console);
  }
  return () => {};
}

exports = module.exports = function historyApiFallback(_options) {
  const options = _options || {};
  const logger = getLogger(options);

  // return function(req, res, next) {
  return function* (next) {
    // var headers = req.headers;
    const accepts = this.accepts().toString();
    var reason = '';
    var parsedUrl;
    var rewriteTarget;
    var rewrites;
    var rewritten;

    if (this.request.method !== 'GET') {
      reason = 'because the method is not GET.';
    }
    else if (!accepts || typeof accepts !== 'string') {
      reason = 'because the client did not send an HTTP accept header.';
    }
    else if (accepts.indexOf('application/json') === 0) {
      reason = 'because the client prefers JSON.';
    }
    else if (!acceptsHtml(accepts)) {
      reason = 'because the client does not accept HTML.';
    }
    else {

      parsedUrl = url.parse(this.request.url);
      rewrites = options.rewrites || [];

      rewritten = rewrites.some(rewrite => {
        const match = parsedUrl.pathname.match(rewrite.from);

        if (match !== null) {
          rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to);
          logger('Rewriting', this.request.method, this.request.url, 'to', rewriteTarget);
          this.request.url = rewriteTarget;
          return true;
        }
      });
      if (rewritten) {
        yield *next;
      }

      if (parsedUrl.pathname.indexOf('.') === -1) {
        rewriteTarget = options.index || '/index.html';
        logger('Rewriting', this.request.method, this.request.url, 'to', rewriteTarget);
        this.request.url = rewriteTarget;
      }
      else {
        reason = 'because the path includes a dot (.) character.';
      }
    }

    if (reason) {
      logger(
        'Not rewriting',
        this.request.method,
        this.request.url,
        reason
      );
    }
    yield *next;
  };
};
