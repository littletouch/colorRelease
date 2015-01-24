'use strict';

angular.module('colorRelease')
  .controller('MenuCtrl', function ($rootScope, $scope, $log, $mdSidenav
) {

    var currentColor = null;

    $scope.colors = [
      {name: 'red', rbg: [255, 0, 0]},
      {name: 'green', rgb: [0, 255, 0]},
      {name: 'blue', rgb: [0, 0, 255]}
    ];

    $scope.goto = function(color) {
      currentColor = color;
      $rootScope.$broadcast('goto', {
        color: color
      });
      $mdSidenav('left').close();
      $log.log('goto');
    };

    $scope.isSelected = function(color) {
      return color === currentColor;
    };
  });
