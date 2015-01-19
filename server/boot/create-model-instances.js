var debug = require('debug')('boot:create-model-instances');

module.exports = function (app) {
  var User = app.models.user;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  User.create([
    {username: 'admin', email: 'admin@gmail.com', password: 'opensesame'},
    {username: 'contributor', email: 'contributor@gmail.com', password: 'opensesame'},
    {username: 'viewer', email: 'viewer@gmail.com', password: 'opensesame'}
  ], function (err, users) {
    if (err) return debug(users);
    //create the admin role
    Role.create({
      name: 'admin'
    }, function (err, role) {
      if (err) return debug(err);
      //console.log(role);

      //debug(role);
      //make admin
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: users[0].id
      }, function (err, principal) {
        if (err) return debug(err);
        debug(principal);
      });
    });

    Role.create({
      name: 'contributor'
    }, function (err, role) {
      if (err) return debug(err);
      //debug(role);
      //make admin
      role.principals.create({
        principalType: RoleMapping.USER,
        principalId: users[1].id
      }, function (err, principal) {
        if (err) return debug(err);
        //debug(principal);
      });
    });
  });
};

