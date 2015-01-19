'use strict';

angular.module('echoCalendarApp.eventDetails', ['ui.bootstrap'])
  .config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/viewEvent/:id', {
        templateUrl: 'views/event/event-details.html',
        controller: 'eventDetailCtrl',
        resolve: {
          eventId: function ($route) {
            return $route.current.params.id;
          },
          $modalInstance: function () {
            alert()
            return null
          }
        }
      })
    }])
  .controller('eventDetailCtrl', function ($scope, $modalInstance, $location, eventId, Event) {
    if (eventId) {
      Event.get({id: eventId}, function (event) {
        $scope.event = event;
      })
    }
    $scope.isModal = $modalInstance;
    $scope.artworks = [];
    $scope.close = function () {
      if ($modalInstance)
        $modalInstance.close();
      else
        $location.path('/');

    };

    $scope.cancel = function () {
      if ($modalInstance)
        $modalInstance.dismiss('cancel');
      else
        $location.path('/');

    };
    $scope.duration = function (start, end) {
      return moment(start).from(end, true);
    }
  });
