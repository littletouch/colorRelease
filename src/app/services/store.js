'use strict';

angular.module('colorRelease')
.factory('store', function ($http, $q, $firebase) {
  var baseRef = new Firebase("https://color-release.firebaseio.com/");

  var albumsRef = baseRef.child('albums');
  var colorsRef = baseRef.child('colors');

  var insertToColor = function(color, album){
    if (!color) return;
    var ref = colorsRef.child(color+'/'+album.id);
    console.log('set album ' + album.id + ' to ' + color);
    ref.set(album);
  }

  var removeFromColor = function(color, album){
    if (!color) return;
    var ref = colorsRef.child(color+'/'+album.id);

    ref.on("value", function(snapshot) {
      var stored = snapshot.val();
      if (stored) {
        ref.remove();
      } else {
        return;
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  }

  var updateAlbumInfo = function(album){
    console.log('update album info', album);
    var ref = albumsRef.child(album.id);
    var colorClass = album.cover.class;

    ref.set(album);
    insertToColor(colorClass, album);
    // ref.on("value", function(snapshot) {
    //   var storedAlbumData = snapshot.val();
    //
    //   if (storedAlbumData) {
    //     if (colorClass != storedAlbumData.cover.class) {
    //       ref.set(album);
    //
    //       removeFromColor(storedAlbumData.cover.class, album);
    //       insertToColor(colorClass, album);
    //     }
    //   } else {
    //     ref.set(album);
    //     insertToColor(colorClass, album);
    //   }
    // }, function (errorObject) {
    //   console.log("The read failed: " + errorObject.code);
    // });

  }

  var service = {
    updateAlbumInfo: updateAlbumInfo
  }

  return service;
});
