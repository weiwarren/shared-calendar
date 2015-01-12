module.exports = function (UserIdentity) {
  UserIdentity.afterSave = function (next) {


    /* var self = this;
     if (self.authScheme === 'saml') {
     for (var i in self.profile.roles) {
     Role.findOne({name: self.profile.roles[i]}, function (err, role) {
     if(err)return;
     console.log("===userId===",self.userId);
     role.principals.findById({
     principalId: self.userId,
     principalType: RoleMapping.USER
     }, function (err, principles) {
     if(err) return;
     console.log("======", self.profile.roles[i])
     console.log("====principles===\n", principles);
     })

     /*role.principals.create(
     {
     principalType: self.roleMappingModel.USER,
     principalId: user.id
     }, function (err, principal) {
     if (err) return err;
     });

     })
     }
     }*/
    next();
  };
};
