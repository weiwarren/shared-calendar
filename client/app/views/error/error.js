'use strict';

angular.module('echoCalendarApp.error', [])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/error/:status', {
      templateUrl: 'views/error/error.html',
      controller: 'errorCtrl'
    });
  }])
  .controller('errorCtrl', function ($scope, $routeParams) {
    $scope.error = {
      status: $routeParams.status
    };
    switch ($routeParams.status) {
      case '401':
        $scope.error.message = 'Sorry, restricted area, .';
        break;
      case '404':
        $scope.error.message = 'Sorry, the page you are looking for does not exist.';
        break;
      default:
        $scope.error.message = 'Something went wrong, please contact administrator for troubleshooting the issue.';
        break;
    }
  })
;
