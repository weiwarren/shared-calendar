module.exports = function(User) {
  //default user access token ttl = 8 hours
  User.settings.ttl = 3600 * 24 * 1000;
};
