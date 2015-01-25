'use strict';

angular.module('colorRelease')
  .controller('MenuCtrl', function ($rootScope, $scope, $log,
    $mdSidenav, $route, $routeParams, $location) {
    var initColor;
    var currentColor = null;

    $scope.colors = [
      {name: 'red', rgb: [244, 67, 54], fontColor: [255, 255, 255]},
      {name: 'green', rgb: [76, 175, 80], fontColor: [255, 255, 255]},
      {name: 'yellow', rgb: [255, 235, 59], fontColor: [255, 255, 255]},
      {name: 'white', rgb: [255, 255, 255], fontColor: [55, 71, 79]},
      {name: 'black', rgb: [33, 33, 33], fontColor: [255, 255, 255]},
      {name: 'blue', rgb: [33, 150, 243], fontColor: [255, 255, 255]},
      {name: 'purple', rgb: [156, 39, 176], fontColor: [255, 255, 255]},
      {name: 'gray', rgb: [158, 158, 158], fontColor: [255, 255, 255]}
    ];

    var gotoColor = function(color) {
      currentColor = color;
      $rootScope.$broadcast('goto', {
        color: color
      });

      if ($route.current.params.colorName != color.name) {
        $location.path(color.name);
      }

      $mdSidenav('left').close();
      $log.log('goto');
    };

    $scope.goto = gotoColor;

    // get color from url or sample one
    var urlColorName = $route.current.params.colorName;

    if ( urlColorName ) {
      console.log('init color from url', urlColorName);
      initColor = _.find($scope.colors, function(color){return color.name == urlColorName});
    }

    if (!initColor) {
      initColor = _.sample($scope.colors)
    }

    gotoColor(initColor);

    $scope.isSelected = function(color) {
      return color === currentColor;
    };
  });
