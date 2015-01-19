module.exports = function (Category) {
  Category.definition.properties.modified.default = function () {
    return new Date();
  };
};
