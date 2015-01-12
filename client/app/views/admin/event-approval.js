'use strict';

angular.module('echoCalendarApp.eventApproval', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eventApproval', {
      templateUrl: 'views/admin/event-approval.html',
      controller: 'eventApprovalCtrl'
    });
  }])
  .controller('eventApprovalCtrl', function ($scope, $modal, $location, FileUploader, Event, Property, EventType, Container) {
    $scope.events = [];

    Event.query(function(events){
      $scope.events = events
    });

    $scope.showDetail =function(event){
      $modal.open({
        templateUrl: 'views/event/event-details.html',
        controller: 'eventDetailCtrl',
        resolve: {
          event: function () {
            return event;
          }
        }
      });
    };
    $scope.publish = function(event){
      event.published = !event.published;
    }
  });
