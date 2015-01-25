'use strict';

angular.module('colorRelease')
.factory('store', function ($http, $q) {
  var baseRef = new Firebase("https://color-release.firebaseio.com/");

  var albumsRef = baseRef.child('albums');
  var colorsRef = baseRef.child('colors');

  var insertToColor = function(color, album){
    if (!color) return;
    // var ref = colorsRef.child(color+'/'+album.id);
    // console.log('set album ' + album.id + ' to ' + color);
    // ref.set(album);
    console.log('set album ' + album.id + ' to ' + color);
    var ref = colorsRef.child(color + '/' + album.id);
    var time = new Date(album['releaseDate']);
    album['timestamp'] = time.getTime()/1000;
    ref.setWithPriority(album, 0 - album['timestamp']);
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

    ref.on("value", function(snapshot) {
      var stored = snapshot.val();
      if (stored) {
        return
      } else {
        ref.set(album);
        insertToColor(colorClass, album);
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

  }

  var service = {
    updateAlbumInfo: updateAlbumInfo
  }

  return service;
});
