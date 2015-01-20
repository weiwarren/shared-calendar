angular.module('echoCalendarApp.shareURL', [])
  .controller('shareURLCtrl', function ($scope, $modalInstance, item) {
    $scope.item = item;
    //angular.copy(filters, $scope.filters);
    $scope.apply = function () {
      $modalInstance.close();
    }
  })
;
