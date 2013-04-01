var verbs = ['get', 'post', 'put', 'delete'];

function isFunction(x) {
  return Object.prototype.toString.call(x) == '[object Function]';
}

module.exports = function(app, config, keys) {
	var ep = [];

	function genElements(els, baseUri, baseExpose) {
		for (var i in els) {
			var el = els[i];
			var elUri = (baseUri || '') + '/' + i;
			elUri = elUri.replace(/\/\//g, '/');

			if (el.expose)
				baseExpose[el.expose] = {
					uri: elUri,
					cache: !!el.cache,
					next: {}
				};

			for (var j in verbs) {
				if (el[verbs[j]]) {
					if (typeof el[verbs[j]] == 'function')
						ep.push({
							uri: elUri,
							verb: verbs[j],
							handler: el[verbs[j]]
						});
					else
						ep.push({
							uri: elUri,
							verb: verbs[j],
							handler: el[verbs[j]].handler,
							middleware: el[verbs[j]].middleware
						});

					if (el.expose)
						baseExpose[el.expose][verbs[j]] = true
				}					
			}

			if (el.next)
				genElements(el.next, elUri, baseExpose[el.expose].next);
		}
	}

	var expose = {};

	genElements(keys, config.uriPrefix || '', expose);
	app.get(((config.uriPrefix || '') + '/manifest').replace(/\/\//g, '/'), function(req, res) {
		if (!req.query.var)
			res.send(expose);
		else {
			res.set('Content-Type', 'text/javascript');
			res.send('var ' + req.query.var + ' = ' + JSON.stringify(expose))
		}
	});

	for (var i = ep.length -1; i >= 0; i--) {
		console.log('route : ' + ep[i].verb + ' > ' + ep[i].uri)
		if (ep[i].middleware)
			app[ep[i].verb](ep[i].uri, ep[i].middleware, ep[i].handler);
		else
			app[ep[i].verb](ep[i].uri, ep[i].handler);
	}

}