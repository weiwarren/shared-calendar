module.exports = function (Property) {
  Property.withCategories = function (filter, cb) {
    Property.find({include:"category"},function(err, results){
      cb(null,results);
    })
  }

  Property.remoteMethod(
    'withCategories',
    {
      accepts: {arg: 'filter', type: 'object'},
      returns: {arg: 'result', type: 'array'},
      http: {verb: 'get'}
    }
  );
};
