module.exports = function(server) {
  var router = server.loopback.Router();
  router.get('/status', server.loopback.status());
  router.get('/401', function (req, res, next) {
    res.redirect('/app/#/error/401');
  });
  server.use(router);
};
