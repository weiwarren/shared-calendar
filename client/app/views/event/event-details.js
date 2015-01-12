'use strict';

angular.module('echoCalendarApp.eventDetails',['ui.bootstrap'])
  .controller('eventDetailCtrl', function ($scope, $modalInstance, event, Property, Container) {
    $scope.event = event;
    $scope.artworks = [];
    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.duration = function(start, end){
      return moment(start).from(end,true);
    }
  });
