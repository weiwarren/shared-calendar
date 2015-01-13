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
  .controller('loginCtrl', function ($scope, $window) {
    if (!$scope.formAuth) {
      $window.location.href = '/auth/adfs';
    }
  })
  .controller('logoutCtrl', function ($scope, $window, LoopBackAuth) {
    LoopBackAuth.clearUser();
    LoopBackAuth.clearStorage();
    $window.location.href = '/auth/adfs/logout';
  })
  .controller('authCBCtrl', function ($scope, $cookies, $location, LoopBackAuth) {

  });

