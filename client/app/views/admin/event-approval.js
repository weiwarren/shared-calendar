'use strict';

angular.module('echoCalendarApp.eventApproval', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/eventApproval', {
      templateUrl: 'views/admin/event-approval.html',
      controller: 'eventApprovalCtrl'
    });
  }])
  .controller('eventApprovalCtrl', function ($scope, $modal, $q, $location, Event) {
    var queryEvent = function () {
      Event.find({filter: {where: {approved: {ne: true}}}}, function (events) {
        $scope.events = events;
      });
    };

    $scope.showDetail = function (event) {
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

    $scope.checkAll = function (val) {
      if ($scope.events) {
        $scope.events.forEach(function (event) {
          event.approved = val;
        })
      }
    };

    $scope.approveAll = function () {
      var events = $scope.events.filter(function (item) {
        return item.approved == true;
      });
      var qs = [];
      events.forEach(function (event) {
        qs.push($scope.approve(event));
      });
      $q.all(qs).then(function () {
        queryEvent();
      });
    };

    $scope.approve = function (event) {
      event.approved = true;
      return event.$save();
    };

    queryEvent();
  });
