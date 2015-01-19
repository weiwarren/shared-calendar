module.exports = function (Event) {

  Event.schedulerList = function (filter, cb) {
    Event.find({
      where: filter,
      fields: {
        id: true,
        text: true,
        start: true,
        cssClass:true,
        end: true,
        resource: true
      }
    }, cb);
  };

  Event.remoteMethod(
    'schedulerList',
    {
      accepts: {arg: 'filter', type: 'object'},
      returns: {arg: 'events', type: 'array'},
      http: {verb: 'get'}
    }
  );

  Event.groupBy = function (filter, cb) {
    Event.dataSource.connector.db.collection("event").aggregate([
        {$project: {_id: 0, id: "$_id", text: 1, start: 1, end: 1, resource: 1, description: 1, backColor: 1}},
        {
          $group: {
            _id: "$category",
            tasks: {$push: "$$ROOT"}
          }
        },
        {
          $project: {
            id: "$_id",
            _id: 0,
            name: "$_id",
            tasks: {id: 1, text: 1, start: 1, end: 1, resource: 1, description: 1, backColor: 1}
          }
        }
      ],
      {
        allowDiskUse: true
      },
      function (err, result) {
        if (err)
          cb(err);
        else {
          cb(null, result);
        }
      });
  };
  Event.remoteMethod(
    'groupBy',
    {
      accepts: {arg: 'filter', type: 'object'},
      returns: {arg: 'result', type: 'array'},
      http: {verb: 'get'}
    }
  );

  Event.exportCSV = function (filter, cb) {
    Event.all(function (data) {
      cb(data);
    })
  };

};
