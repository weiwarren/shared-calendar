angular.module('echoCalendarApp.advanceFilter', [])
  .controller('advanceFilterCtrl', function ($scope, $modal, $timeout, $modalInstance, filters, Product, Property, Customer) {
    $scope.filters = filters || {
      product: {all: true, include: []},
      customer: {all: true, include: []},
      venue: {all: true, include: []}
    };
    //angular.copy(filters, $scope.filters);
    Product.query(function (products) {
      products.forEach(function (p) {
        p.checked = $scope.filters.product.all || $scope.filters.product.include.filter(function (item) {
          return item.key == p.key
        }).length;
      });
      $scope.products = products;
    });

    Customer.query(function (customers) {
      customers.forEach(function (c) {
        c.checked = $scope.filters.customer.all || $scope.filters.customer.include.filter(function (item) {
          return item.key == c.key
        }).length;
      });
      $scope.customers = customers;
    });

    Property.query(function (properties) {
      $scope.venues = [];
      properties.forEach(function (property) {
        property.venues.forEach(function (venue) {
          if (!$scope.venues.filter(function (item) {
              return item.key == venue.key
            }).length) {
            venue.checked = $scope.filters.venue.all || $scope.filters.venue.include.filter(function (item) {
              return item.key == venue.key
            }).length;
            $scope.venues.push(venue);
          }
        });
      });
    });

    $scope.checkAll = function (filter, collection) {
      filter.include.length = 0;
      collection.forEach(function (c) {
        c.checked = filter.all;
      });
    };

    $scope.updateFilter = function (filter, collection) {
      filter.include.length = 0;
      collection.forEach(function (c) {
        if (c.checked) {
          filter.include.push({key: c.key, name: c.name});
        }
      });
      filter.all = filter.include.length == collection.length;
    };

    $scope.apply = function () {
      $modalInstance.close($scope.filters);
    }
  })
;
