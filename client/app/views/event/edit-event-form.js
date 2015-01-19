'use strict';

angular.module('echoCalendarApp.editEvent', ['ngRoute', 'ui.bootstrap', 'angularFileUpload'])
  .config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/addEvent', {
        templateUrl: 'views/event/edit-event-form.html',
        controller: 'addEventCtrl',
        resolve: {
          isModal: function () {
            return false;
          }
        }
      }).when('/editEvent/:id', {
        templateUrl: 'views/event/edit-event-form.html',
        controller: 'editEventCtrl',
        resolve: {
          isModal: function () {
            return false;
          },
          eventItem: function ($q, Event, $route, $location) {
            return Event.get({id: $route.current.params.id}).$promise.then(function (item) {
              return item;
            }, function (response) {
              $location.path('/error/' + response.status);
            });
          }
        }
      });
    }])
  .controller('eventCtrl', function ($scope, $q, $location, $modal, Property, EventType, Duration, Customer, Container, FileUploader) {

    $scope.filesToBeRemoved = [];
    //TODO: security settings on this
    $scope.checkApproval();

    //load event types
    EventType.query(function (eventTypes) {
      $scope.eventTypes = eventTypes;
      if ($scope.queryParams.eventTypeKey) {
        $scope.event.eventTypeKey = $scope.queryParams.eventTypeKey;
        $scope.event.eventType = $scope.eventTypes.filter(function (item) {
          return item.key == $scope.event.eventTypeKey
        })[0];
      }
      if ($scope.queryParams.categoryKey) {
        $scope.event.categoryKey = $scope.queryParams.categoryKey;
        $scope.event.category =$scope.event.eventType.categories.filter(function (item) {
          return item.key == $scope.event.categoryKey
        })[0];
      }
    });

    Customer.query(function (customers) {
      $scope.customers = customers;
    });

    Duration.query(function (durations) {
      $scope.durationOptions = durations;
    });

    //load properties
    Property.query(function (properties) {
      $scope.properties = properties;
      if ($scope.queryParams.propertyKey) {
        $scope.eventProperties = [{
          propertyKey: $scope.queryParams.propertyKey, property: properties.filter(function (item) {
            return item.key == $scope.queryParams.propertyKey
          })[0]
        }];
      }
    });

    //update the duration based on start and end date
    $scope.setDuration = function (event, length, unit) {
      event.duration = moment.duration(length, unit);
      //element.data('DateTimePicker').setDate(d);
    };

    $scope.addEvent = function () {
      $scope.event.multiEvents.push({});
    };

    $scope.removeEvent = function (index) {
      $scope.event.multiEvents.splice(index, 1);
    };

    $scope.addProperty = function () {
      if (!$scope.eventProperties) {
        $scope.eventProperties = [];
      }
      $scope.eventProperties.push({});
    };

    $scope.removeProperty = function (index) {
      $scope.eventProperties.splice(index, 1);
    };

    $scope.$watch('event.allDay', function (nv) {
      if (nv) {
        $scope.event.dateFormat = 'DD/MM/YYYY';
        $scope.dbDateFormat = 'YYYY-MM-DDT00:00:00'
      }
      else {
        $scope.event.dateFormat = 'DD/MM/YYYY hh:mm a';
        $scope.dbDateFormat = 'YYYY-MM-DDTHH:mm:ss'
      }
    });

    $scope.getEventForProperty = function (ep) {
      var event = {};
      angular.copy($scope.event, event);
      if (event.occurrence == 'single') {
        delete event.multiEvents;
      }
      event.start = moment(event.start, $scope.event.dateFormat).format($scope.dbDateFormat);
      event.end = moment(event.end, $scope.event.dateFormat).format($scope.dbDateFormat);
      event.timezone = moment().zone();
      event.duration = event.duration.humanize();
      event.resource = (ep.property.key + "-" + event.eventType.key + "-" + event.category.key);
      event.cssClass = (ep.property.key + " " + event.eventType.key + " " + event.category.key + " Item");
      event.coordinator = ep.coordinator;
      event.property = ep.property;
      event.properties = event.properties || $scope.eventProperties;
      event.metadata.venue = ep.venue;
      return event;
    };

    $scope.getMultiEvent = function (event, me) {
      var e1 = {};
      angular.copy(event, e1);
      //var dbDateFormat = e1.allDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm';
      e1.start = moment(me.start, $scope.event.dateFormat).format($scope.dbDateFormat);
      e1.end = moment(me.end, $scope.event.dateFormat).format($scope.dbDateFormat);
      return e1;
    };

    $scope.initFileUploader = function () {
      //artwork uploader handler
      var artworkUploader = $scope.artworkUploader = new FileUploader({
        url: '/api/containers/' + $scope.containerId + '/upload?access_token=' + $scope.accessToken,
        formData: [
          {key: 'value'}
        ],
        filters: [{
          name: 'imageFilter',
          fn: function (item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|svg|exif|tiff|'.indexOf(type) !== -1;
          }
        }],
        queueLimit: 5
      });

      artworkUploader.onSuccessItem = function (item, response, status, headers) {
        $scope.event.metadata.artworks.push({
          file: item.file,
          container: $scope.containerId,
          ctime: (new Date())
        });
      };

      artworkUploader.onCompleteAll = function () {
        $scope.artworksUploaded = true;
        $scope.$emit('uploadAllCompleted');
      };

      //attachment uploader handler
      var attachmentUploader = $scope.attachmentUploader = new FileUploader({
        url: '/api/containers/' + $scope.containerId + '/upload?access_token=' + $scope.accessToken,
        formData: [
          {key: 'value'}
        ]
      });

      attachmentUploader.onSuccessItem = function (item, response, status, headers) {
        console.info('Success', item, response);
        $scope.event.metadata.attachments.push({
          file: item.file,
          container: $scope.containerId,
          ctime: (new Date())
        });
      };

      attachmentUploader.onCompleteAll = function () {
        $scope.attachmentsUploaded = true;
        $scope.$emit('uploadAllCompleted');
      };

      $scope.deleteFile = function (collection, index) {
        if (confirm("Would you like to permanently remove the file?")) {
          if (!$scope.filesToBeRemoved.filter(function (item) {
              return item.file == collection[index].file.name;
            }).length) {
            $scope.filesToBeRemoved.push({container: $scope.containerId, file: collection[index].file.name});
          }
        }
        collection.splice(index, 1);
      };

      $scope.recycleFile = function (file) {
        Container.removeFile({container: $scope.containerId, file: file}, function () {
          alert('done!');
        }, function () {
          alert('error');
        });
      }

      $scope.recycleFiles = function () {
        var defer = $q.defer();
        var qs = [];
        $scope.filesToBeRemoved.forEach(function (rm) {
          qs.push((function () {
            var deferred = $q.defer();
            Container.getFile({container: rm.container, file: rm.file}, function (file) {
              Container.removeFile({container: rm.container, file: rm.file}).$promise.then(function () {
                deferred.resolve();
              });
            }, function () {
              deferred.resolve();
            });
            return deferred.promise;
          })());
        });
        $q.all(qs).then(function () {
          defer.resolve();
        });
        return defer.promise;
      }
    };

    $scope.uploadFiles = function () {
      $scope.event.metadata.containerId = $scope.containerId;
      //create a folder for the attachments before upload, this container id will be associated with the event object
      Container.getContainer({container: $scope.containerId}, function (container) {
        if ($scope.attachmentUploader.queue.length)
          $scope.attachmentUploader.uploadAll();
        if ($scope.artworkUploader.queue.length)
          $scope.artworkUploader.uploadAll();
      }, function () {
        Container.create({name: $scope.containerId}, function () {
          if ($scope.attachmentUploader.queue.length)
            $scope.attachmentUploader.uploadAll();
          if ($scope.artworkUploader.queue.length)
            $scope.artworkUploader.uploadAll();
        });
      });
    };

    $scope.showLoading = function () {
      $scope.loadingModal = $modal.open({
        template: '<div class="modal-body">One moment, please ...</div>',
        backdrop: 'backdrop'
      });
    };

    $scope.hideLoading = function () {
      if ($scope.loadingModal)
        $scope.loadingModal.close();
    }
  })
  .controller('addEventCtrl', function ($scope, $location, $route, $routeParams, isModal, $controller, Event, Property, EventType, Container, $q) {
    $controller('eventCtrl', {$scope: $scope});
    $scope.eventProperties = [{}];
    $scope.event = {
      occurrence: 'single',
      multiEvents: [{}],
      metadata: {
        artworks: [],
        attachments: []
      }
    };

    $scope.closeForm = function () {
      $scope.hideLoading();
      if (isModal) {
        $scope.$close();
      }
      else {
        $location.path('/')
      }
    };

    $scope.containerId = $scope.event.id || $scope.guid();
    $scope.initFileUploader();
    //get start end date from url
    (function parseDateFromUrl() {
      $scope.queryParams = {};
      var start = $location.search().start;
      var end = $location.search().end;
      var resource = $location.search().resource;
      if (start) {
        $scope.event.start = moment(start);
      }
      if (end) {
        $scope.event.end = moment(end);
      }
      if (start && end) {
        $scope.event.duration = moment.duration($scope.event.start.diff($scope.event.end));
      }
      if (resource) {
        var keys = resource.split('-');
        if (keys && keys.length) {
          $scope.queryParams = {propertyKey: keys[0], eventTypeKey: keys[1], categoryKey: keys[2]};
        }
      }
    })();

    var saveEvent = function () {
      var eventsPromises = [];

      //multi property
      $scope.eventProperties.forEach(function (ep) {
        var event = $scope.getEventForProperty(ep);
        eventsPromises.push(Event.create(event).$promise.then(function (response) {
          console.log(response);
        }));

        //multi events
        $scope.event.multiEvents.forEach(function (me) {
          if (me.start) {
            eventsPromises.push(Event.create($scope.getMultiEvent(event, me)).$promise.then(function (response) {
              console.log(response);
            }));
          }
        });
      });
      $q.all(eventsPromises).then(function () {
        $scope.closeForm();
        $route.reload();
      });
    };

    $scope.submitForm = function (form) {
      form.submitting = (new Date());
      if (form.$valid) {
        $scope.showLoading();
        //upload files
        if ($scope.event.metadata.hasArtwork || $scope.event.metadata.hasAttachment) {
          $scope.uploadFiles();
          $scope.$on('uploadAllCompleted', function (e, items) {
            //make sure both attachment and artworks are saved
            var canSave = (!$scope.event.metadata.hasArtwork || $scope.artworksUploaded) && (!$scope.event.metadata.hasAttachment || $scope.attachmentsUploaded)
            if (canSave) {
              saveEvent();
            }
          });
        }
        else {
          saveEvent();
        }
      }
    };
  })
  .controller('editEventCtrl', function ($scope, $route, isModal, $location, eventItem, $controller, $routeParams, Event, Property, EventType) {
    $controller('eventCtrl', {$scope: $scope});
    $scope.editing = true;
    $scope.loading = true;
    //load event
    $scope.event = eventItem;
    $scope.event.start = moment($scope.event.start).format($scope.event.dateFormat);
    $scope.event.end = moment($scope.event.end).format($scope.event.dateFormat);
    $scope.event.duration = moment.duration(moment($scope.event.end, $scope.event.dateFormat).diff(moment($scope.event.start, $scope.event.dateFormat)));
    $scope.containerId = $scope.event.metadata.containerId || $scope.guid();
    $scope.eventProperties = $scope.event.properties.filter(function (item) {
      return item.propertyKey == $scope.event.property.key;
    });
    $scope.loading = false;
    $scope.initFileUploader();


    $scope.closeForm = function (reload) {
      $scope.hideLoading();
      if (isModal) {
        $scope.$close();
        if (reload) {
          $route.reload();
        }
      }
      else {
        $location.path('/')
      }
    };

    var saveEvent = function () {
      $scope.eventProperties.forEach(function (ep) {
        var event = $scope.getEventForProperty(ep);
        console.log(event);
        event.$save(function () {
          $scope.closeForm();
        });
      })
    };

    $scope.submitForm = function (form) {
      form.submitting = (new Date());
      if (form.$valid) {
        $scope.showLoading();
        //remove file from the fs first
        $scope.recycleFiles().then(function () {
          if (($scope.event.metadata.hasArtwork && $scope.artworkUploader.queue.length) || ($scope.event.metadata.hasAttachment && $scope.attachmentUploader.queue.length)) {
            //upload new files
            $scope.uploadFiles();
            $scope.$on('uploadAllCompleted', function (e, items) {
              //make sure both attachment and artworks are saved
              var artworkSaved = !$scope.event.metadata.hasArtwork || ($scope.artworksUploaded) || !$scope.artworkUploader.queue.length;
              var attachmentSaved = !$scope.event.metadata.hasAttachment || $scope.attachmentsUploaded || !$scope.attachmentUploader.queue.length;
              var canSave = artworkSaved && attachmentSaved;
              if (canSave) {
                saveEvent();
              }
            });
          }
          else {
            saveEvent();
          }
        });
      }
    };


    $scope.deleteEvent = function () {
      if (confirm('Are you sure you want to delete this event?')) {
        $scope.showLoading();
        Event.delete({id: $scope.event.id}, function () {
          $scope.closeForm();
        })
      }

    }

  })
  .controller('FilesController', function ($scope, $http, Container) {

  });
