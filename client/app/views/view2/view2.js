'use strict';

angular.module('echoCalendarApp.view2', ['ngRoute', 'angularFileUpload'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view2', {
      templateUrl: 'views/view2/view2.html',
      controller: 'View2Ctrl'
    });
  }])

  .controller('View2Ctrl', function ($scope, $fileUploader,$http) {
    // create a uploader with options
    var uploader = $scope.uploader = $fileUploader.create({
      scope: $scope,                          // to automatically update the html. Default: $rootScope
      url: '/api/containers/attachments/upload',
      formData: [
        {key: 'value'}
      ],
      filters: [
        function (item) {                    // first user filter
          console.info('filter1');
          return true;
        }
      ]
    });

    // ADDING FILTERS

    uploader.filters.push(function (item) { // second user filter
      console.info('filter2');
      return true;
    });

    // REGISTER HANDLERS

    uploader.bind('afteraddingfile', function (event, item) {
      console.info('After adding a file', item);
    });

    $scope.removeItem = function(item){
      $http.delete('/api/containers/attachments/files/' + encodeURIComponent(item.file.name)).success(function (data, status, headers) {
        item.remove()
      }).error(function(){
          item.remove();
      });
    }
    uploader.bind('remove', function (event, xhr, item) {
      alert()
    });
    uploader.bind('whenaddingfilefailed', function (event, item) {
      console.info('When adding a file failed', item);
    });

    uploader.bind('afteraddingall', function (event, items) {
      console.info('After adding all files', items);
    });

    uploader.bind('beforeupload', function (event, item) {
      console.info('Before upload', item);
    });

    uploader.bind('progress', function (event, item, progress) {
      console.info('Progress: ' + progress, item);
    });

    uploader.bind('success', function (event, xhr, item, response) {
      console.info('Success', xhr, item, response);
      $scope.$broadcast('uploadCompleted', item);
    });

    uploader.bind('cancel', function (event, xhr, item) {
      console.info('Cancel', xhr, item);
    });

    uploader.bind('error', function (event, xhr, item, response) {
      console.info('Error', xhr, item, response);
    });

    uploader.bind('complete', function (event, xhr, item, response) {
      console.info('Complete', xhr, item, response);
    });

    uploader.bind('progressall', function (event, progress) {
      console.info('Total progress: ' + progress);
    });

    uploader.bind('completeall', function (event, items) {
      console.info('Complete all', items);
    });


  }).controller('FilesController', function ($scope, $http, Container) {
    $scope.load = function () {
      Container.getFiles({container:"attachments"}).$promise.then(function(response){
        console.log(response);
        $scope.files = response;
      })
    };

    $scope.delete = function (index, id) {
      console.log(encodeURIComponent(id));
      Container.removeFile("attachments", encodeURIComponent(id), function(){
        $scope.files.splice(index, 1);
      })

    };

    $scope.$on('uploadCompleted', function(event) {
      console.log('uploadCompleted event received');
      $scope.load();
    });

  });
