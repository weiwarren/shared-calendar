angular.module('echoCalendarApp.loading', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/loading', {
      templateUrl: 'partials/loading.html'
    });
  }])
