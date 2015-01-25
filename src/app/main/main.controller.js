'use strict';

angular.module('colorRelease')
  .controller('MainCtrl', function ($scope, $timeout, $mdSidenav, $log, coverService, $firebase) {

    var colorRef = new Firebase('https://color-release.firebaseio.com/colors/');
    $scope.openMenu = function() {
      $mdSidenav('left').open();
    };

    var updateAlbums = function(color, amount) {
      var ref = colorRef.child(color).limitToLast(amount);

      var sync = $firebase(ref);
      var albumsArray = sync.$asArray();
      $scope.albums = albumsArray;
      console.log('updated album!');
    }

    $scope.$on('goto', function(event, data) {
      $log.log('goto color ' + data.color.name);
      updateAlbums(data.color.name, 20);
    });

    coverService.init();
  });
