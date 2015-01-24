'use strict';

angular.module('colorRelease')
  .controller('MainCtrl', function ($scope, $timeout, $mdSidenav, $log, coverService) {
    coverService.init();

    $scope.filter = null;

    $scope.openMenu = function() {
      $mdSidenav('left').open();
    };

    $scope.albums = [
      {name: 'foo', color: 'red'},
      {name: 'bar', color: 'blue'},
      {name: 'baz', color: 'green'}
    ];

    $scope.$on('goto', function(event, data) {
      $scope.filter = data.color.name;
      $log.log($scope.filter);
    });
  });
