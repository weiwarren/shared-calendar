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
  .controller('loginCtrl', function ($scope, $window, $location, $localStorage) {
    if (!$scope.formAuth) {
      $localStorage["redirect_url"] = $location.nextAfterLogin;
      $window.location.href = '/auth/adfs';
    }
  })
  .controller('logoutCtrl', function ($scope, $window, $cookies, LoopBackAuth) {
    LoopBackAuth.clearUser();
    LoopBackAuth.clearStorage();
    delete $cookies["access_token"];
    $window.location.href = '/auth/adfs/logout';
  })
  .controller('authCBCtrl', function ($scope, $cookies, $location, LoopBackAuth) {

  });

