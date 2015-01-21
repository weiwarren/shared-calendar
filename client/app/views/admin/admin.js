'use strict';

angular.module('echoCalendarApp.admin', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/admin', {
      templateUrl: 'views/admin/admin.html',
      controller: 'adminCtrl'
    });
  }])
  .controller('adminCtrl', function ($scope, $modal, $q, $location, Property, EventType, Customer) {
    Property.query(function (properties) {
      $scope.properties = properties;
    });

    var queryCustomer = function(){
      Customer.query(function(customers){
        $scope.customers = customers;
      });
    };

    $scope.save = function(){
      var qs = [];
      $scope.showLoading();
      $scope.customers.forEach(function(c){
        if(c.name){
          c.key = c.name.replace(/\s+/g, '');
        }
        if(c.id){
          qs.push(c.$save());
        }
        else{
          qs.push(Customer.create(c));
        }
      });

      $scope.properties.forEach(function(p){
        p.venues.forEach(function(c){
          if(c.name){
            c.key = c.name.replace(/\s+/g, '');
          }
        });
        qs.push(p.$save());
      });
      $q.all(qs).then(function(){
        $scope.hideLoading();
      });
    };

    queryCustomer();
  });
