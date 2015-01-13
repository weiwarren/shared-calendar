module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();

  /* local authentication for testing */
  server.get('/local', function (req, res, next) {
    res.render('pages/local', {
      user: req.user,
      url: req.url
    });
  });

  server.get('/signup', function (req, res, next) {
    res.render('pages/signup', {
      user: req.user,
      url: req.url
    });
  });

  server.get('/login', function (req, res, next) {
    res.render('pages/login', {
      user: req.user,
      url: req.url
    });
  });

  server.get('/auth/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
  });

};
