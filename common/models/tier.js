module.exports = function(Tier) {
  Tier.definition.properties.modified.default = function () {
    return new Date();
  };
};
