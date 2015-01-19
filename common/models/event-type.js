module.exports = function(EventType) {
  EventType.definition.properties.modified.default = function () {
    return new Date();
  };
};
