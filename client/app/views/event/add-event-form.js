'use strict';

angular.module('echoCalendarApp.addEvent', ['ngRoute', 'ui.bootstrap', 'angularFileUpload'])
  .config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/addEvent', {
        templateUrl: 'edit-event-form.html',
        controller: 'addEventCtrl'
      });
    }])
  .controller('addEventCtrl', function ($scope, $modal, $location, FileUploader, Event, Property, EventType,Duration, Container) {
    $scope.debug = $location.search().debug;
    $scope.multiEvents = [];
    $scope.eventProperties = [{}];
    $scope.event = {
      occurrence: 'single',
      metadata: {
        artworks: [],
        attachments: []
      }
    };
    $scope.containerId = $scope.event.id || $scope.guid();

    //get start end date from url
    var start = $location.search().start;
    var end = $location.search().end;
    if (start) {
      $scope.event.start = moment(start);
    }
    if (end) {
      $scope.event.end = moment(end);
    }
    if (start && end) {
      $scope.event.duration = moment.duration($scope.event.start.diff($scope.event.end));
    }

    EventType.query(function (eventTypes) {
      $scope.eventTypes = eventTypes;
    });

    Property.query(function (properties) {
      $scope.properties = properties;
    });

    $scope.addProperty = function () {
      $scope.eventProperties.push({});
    };

    $scope.removeProperty = function (index) {
      $scope.eventProperties.splice(index, 1);
    };

    Duration.query(function(durations){
      $scope.durationOptions = durations;
    });

    $scope.setDuration = function (event, length, unit) {
      event.duration = moment.duration(length,unit);
    };

    $scope.addEvent = function () {
      $scope.multiEvents.push({});
    };

    $scope.removeEvent = function (index) {
      $scope.multiEvents.splice(index, 1);
    };

    var uploadFiles = function () {
      //create a folder for the attachments before upload, this container id will be associated with the event object
      Container.getContainer({container: $scope.containerId}, function (container) {
        $scope.attachmentUploader.uploadAll();
        $scope.artworkUploader.uploadAll();
      }, function () {
        Container.create({name: $scope.containerId}, function () {
          $scope.attachmentUploader.uploadAll();
          $scope.artworkUploader.uploadAll();
        });
      });
    };

    var saveEvent = function () {
      //multi property
      var eventType = $scope.eventTypes.filter(function (item) {
          return $scope.event.eventType == item.key
        })[0],
        category = eventType.categories.filter(function (item) {
          return $scope.event.category == item.key
        })[0],
        product = $scope.event.product ? eventType.products.filter(function (item) {
          return $scope.event.product == item.key
        })[0] : null;
      $scope.eventProperties.forEach(function (ep) {
        var property = $scope.properties.filter(function(item){return item.id == ep.property})[0];
        var event = {
          text: $scope.event.text,
          start: moment($scope.event.start, 'L LT').toISOString(),
          end: moment($scope.event.end, 'L LT').toISOString(),
          duration: $scope.duration,
          eventType: eventType,
          category: category,
          product: product,
          people: parseInt($scope.event.people),
          occurrence: $scope.event.occurrence,
          multiEvents: $scope.multiEvents,
          resource: (property.key + "-" + $scope.event.eventType + "-" + $scope.event.category),
          property: {
            name: property.name,
            key: property.key,
            id: property.id
          },
          properties: ep,
          cssClass: property.key + " " + $scope.event.eventType + " " + $scope.event.category + " Item",
          venue: ep.venue,
          coordinator: ep.coordinator,
          metadata: $scope.event.metadata
        };

        Event.create(event).$promise.then(function (event) {
          alert(event.text + " created for " + event.property.name);
        });
        //multi events
        $scope.multiEvents.forEach(function (me) {
          if (me.start) {
            var e1 = {};
            angular.copy(event, e1);
            e1.start = moment(me.start, 'L LT').toISOString();
            e1.end = moment(me.end, 'L LT').toISOString();
            e1.duration = me.duration;
            Event.create(e1).$promise.then(function (event) {
              alert(event.text + " created for " + event.property.name);
            });
          }
        });
      })
    };

    $scope.submitForm = function (form) {
      form.submitting = true;
      if (form.$valid) {
        //upload files
        if ($scope.event.metadata.hasArtwork || $scope.event.metadata.hasAttachment) {
          uploadFiles();
          $scope.$on('uploadAllCompleted', function (e, items) {
            //make sure both attachment and artworks are saved
            var canSave = (!$scope.event.metadata.hasArtwork || $scope.artworkUploaded) && (!$scope.event.metadata.hasAttachment || $scope.attachmentsUploaded)
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

    //artwork uploader handler
    var artworkUploader = $scope.artworkUploader = new FileUploader({
      url: '/api/containers/' + $scope.containerId + '/upload',
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
      console.info('Success', item, response);
      $scope.event.metadata.artworks.push({
        file: item.file,
        container: $scope.containerId,
        ctime: (new Date())
      });
    };

    artworkUploader.onCompleteAll = function () {
      $scope.artworkUploaded = true;
      $scope.$emit('uploadAllCompleted');
    };

    //attachment uploader handler
    var attachmentUploader = $scope.attachmentUploader = new FileUploader({
      url: '/api/containers/' + $scope.containerId + '/upload',
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

  })
  .controller('FilesController', function ($scope, $http, Container) {
    $scope.load = function () {
      Container.getFiles("attachments", true, function (files) {
        $scope.files = files
      })
    };

    $scope.delete = function (index, id) {
      Container.removeFile("attachments", encodeURIComponent(id), function () {
        $scope.files.splice(index, 1);

      })

    };

    $scope.$on('uploadCompleted', function (event) {
      console.log('uploadCompleted event received');
      $scope.load();
    });

  });
