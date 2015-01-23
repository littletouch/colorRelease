'use strict';

angular.module('colorRelease')
  .factory('coverService', function ($http, $q, Spotify, $interval) {

    var FEED_API_URL = 'https://ajax.googleapis.com/ajax/services/feed/load'

    var RSS_URL = 'https://itunes.apple.com/WebObjects/MZStore.woa/wpa/MRSS/newreleases/sf=143441/limit=100/rss.xml';


    var parseNewRelease = function(data) {
      var items = data['responseData']['feed']['entries'];

      var albums = _.map(items, function(item){
        var content = item['contentSnippet']
        var chucks = content.split('by');
        var artist = $.trim(chucks[1]);
        var title;

        if (_.contains(content, ' Single')) {
          title = ""
        } else {
          title = $.trim(chucks[0].split('-')[0]);
        }


        return {
          'itunes_link': item['link'],
          'genre': item['categories'].join(','),
          'artist': artist,
          'title': title,
          'date': item['publishedDate']
        }
      });

      return _.filter(albums, function(item){ return item['title']!=""});
    };

    var getNewReleases = function(){
      var deferred = $q.defer();

      var param = {
        'v': '1.0',
        'q': encodeURI(RSS_URL),
        'callback': 'JSON_CALLBACK',
        'num': 100
      }

      $http.jsonp(FEED_API_URL, {'params': param})
      .success(function(data) {
        var albums = parseNewRelease(data);
        deferred.resolve(albums);
      })
      .error(function(data, status, headers, config) {
        alert("failed loading data")
      });

      return deferred.promise;
    }

    var processAlbum = function (album) {
      var date = new Date(album['date']);
      var albumCluse = 'album:' + album['title'];
      var artistCluse = 'artist:' + album['artist'];
      var yearCluse = 'year:' + date.getFullYear();

      var q = [albumCluse, artistCluse].join('+')

      Spotify.api('/search', 'GET', {
        q: q,
        type: 'album'
      }).then(function (data) {
        console.log(data);
        if (data.albums.items.length>0) {
          console.log('found');
        } else {
          console.log('not found')
        }

      });

    };

    var processAlbums = function (albums){
      var task = $interval(function(){
        var album = albums.pop();

        processAlbum(album);
      }, 4000, albums.length);

    }


    var init = function() {
      getNewReleases()
        .then(function(data){
          console.log('start processing');
          processAlbums(data);
        });
    };

    var service = {
      init: init
    }

    return service;
  });
