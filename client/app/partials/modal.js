angular.module('echoCalendarApp.modal', [])
  .controller('modalCtrl', function ($scope, $modalInstance, item) {
    $scope.item = item;
    //angular.copy(filters, $scope.filters);
    $scope.apply = function () {
      $modalInstance.close();
    }
  })
;
