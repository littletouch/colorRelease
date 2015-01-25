'use strict';

angular.module('colorRelease')
  .controller('MainCtrl', function ($scope, $timeout, $mdSidenav, $log, coverService, $firebase) {
    var $toolbar = $('md-toolbar');
    var $sidebar = $('.sidebar');
    var colorRef = new Firebase('https://color-release.firebaseio.com/colors/');

    $scope.openMenu = function() {
      $mdSidenav('left').open();
    };

    var updateAlbums = function(color, amount) {

      if(!amount) {
        amount = 20;
      }

      var ref = colorRef.child(color).limitToLast(amount);

      var albumsArray = $firebase(ref).$asArray();
      albumsArray.$loaded().then(function() {
        $scope.isLoading = false;
        $scope.albums = albumsArray;
      })
    }

    var updateStyle = function(color) {
      console.log(color);
      $toolbar.css(
        'background-color', "rgb(" + color.rgb.join(',')+  ")"
      );

      if (color.fontColor) {
        $toolbar.find('.text').css(
          'color', "rgb(" + color.fontColor.join(',')+  ")"
        );
      }

      $sidebar.css(
        'background-color', "rgba(" + color.rgb.join(',')  + ",0.3" + ")"
      )


    }

    $scope.isLoading = true;

    $scope.$on('goto', function(event, data) {
      if(!data.color) return;
      $scope.isLoading = true;
      $log.log('goto color ' + data.color.name);
      updateAlbums(data.color.name);
      updateStyle(data.color);
    });

    coverService.init();
  });
