module.exports = function(ConfigState) {
  ConfigState.definition.properties.modified.default = function () {
    return new Date();
  };
  ConfigState.definition.properties.created.default = function () {
    return new Date();
  };
};
