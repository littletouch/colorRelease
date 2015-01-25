'use strict';

angular.module('colorRelease')
  .controller('MenuCtrl', function ($rootScope, $scope, $log, $mdSidenav
) {

    var currentColor = null;

    $scope.colors = [
      {name: 'red', rbg: [255, 0, 0]},
      {name: 'green', rgb: [0, 255, 0]},
      {name: 'yellow', rgb: [255, 255, 0]},
      {name: 'white', rbg: [255, 255, 255]},
      {name: 'black', rgb: [0, 0, 0]},
      {name: 'blue', rgb: [0, 0, 255]},
      {name: 'purple', rgb: [128, 0, 128]},
      {name: 'gray', rgb: [128, 128, 128]}
    ];

    var gotoColor = function(color) {
      currentColor = color;
      $rootScope.$broadcast('goto', {
        color: color
      });
      $mdSidenav('left').close();
      $log.log('goto');
    };

    $scope.goto = gotoColor;

    var initColor = _.sample($scope.colors)
    gotoColor(initColor);

    $scope.isSelected = function(color) {
      return color === currentColor;
    };
  });
