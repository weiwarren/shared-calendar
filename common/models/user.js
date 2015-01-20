module.exports = function(User) {
  //default user access token ttl = 8 hours
  var oneMin = 60 * 1000;
  var oneDay =  3600 * 1000 * 24;
  User.settings.ttl = oneDay;
};
