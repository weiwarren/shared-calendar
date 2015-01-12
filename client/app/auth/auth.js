'use strict';

angular.module('echoCalendarApp.auth', ['ngRoute', 'ui.bootstrap'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'auth/auth.html',
      controller: 'loginCtrl',
      resolve: {}
    }).when('/logout', {
      templateUrl: 'auth/auth.html',
      controller: 'logoutCtrl'
    }).when('/authCB', {
      templateUrl: 'auth/auth.html',
      controller: 'authCBCtrl'
    });
  }])
  .controller('loginCtrl', function ($scope, $window, $location, User) {
    if (!$scope.formAuth) {
      $window.location.href = '/auth/adfs';
    }
  })
  .controller('logoutCtrl', function ($scope, $location, User) {
    User.logout(function () {
      var next = $location.nextAfterLogin || '/';
      $location.nextAfterLogin = null;
      $location.path(next);
    });
  })
  .controller('authCBCtrl', function ($scope, $cookies, $location, LoopBackAuth) {

  });

