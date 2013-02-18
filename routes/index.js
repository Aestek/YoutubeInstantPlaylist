
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

/*
 * GET app.
 */

exports.app = function(req, res){
  res.render('app');
};

/*
 * GET remote.
 */

exports.remote = function(req, res){
  res.render('remote');
};