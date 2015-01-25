'use strict';

angular.module('colorRelease')
  .factory('coverService', function ($http, $q, $interval, store,  $rootScope) {


    var FEED_API_URL = 'https://ajax.googleapis.com/ajax/services/feed/load'
    var ITUNES_API_URL  = 'https://itunes.apple.com/lookup'
    var RSS_URL = 'https://itunes.apple.com/WebObjects/MZStore.woa/wpa/MRSS/newreleases/sf=143441/limit=100/rss.xml';


    var rgbToHsl = function (r, g, b){
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if(max == min){
        h = s = 0; // achromatic
      }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return [h, s, l];
    }

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
          title = title.replace(/ *\([^)]*\) */g, "");
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

    var getiTunesInfoById = function(itunesId) {
      var deferred = $q.defer();

      var param = {
        'id': itunesId,
        'callback': 'JSON_CALLBACK',
      }

      $http.jsonp(ITUNES_API_URL, {'params': param})
      .success(function(data) {
        var results = data['results'];
        var albumTmp;
        var album;

        if (results.length > 0) {
          albumTmp = results[0];
          album = {
            'id': itunesId,
            'artwork': albumTmp['artworkUrl100'].replace('100x100', '326x326'),
            'artist': albumTmp['artistName'],
            'title': albumTmp['collectionName'],
            'releaseDate': albumTmp['releaseDate'],
            'link': albumTmp['collectionViewUrl'],
            'genre': albumTmp['primaryGenreName'],
            'artist_link': albumTmp['artistViewUrl'] || '',
            'artist_id': albumTmp['artistId']
          }
          deferred.resolve(album);
        } else {
          deferred.resolve(null);
        }
      })
      .error(function(data, status, headers, config) {
        console.log("failed loading data")
      });

      return deferred.promise;
    }

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
        console.log("failed loading data")
      });

      return deferred.promise;
    }

    var calculateColorDistance = function (pointA, pointB) {
      var dr = pointA.red - pointB.red,
        dg = pointA.green - pointB.green,
        db = pointA.blue - pointB.blue;
      return Math.sqrt(Math.pow(dr, 2)+Math.pow(dg, 2) + Math.pow(db, 2));
    }

    var colorCollection = {
      red:  {red: 128, green: 0, blue: 0},
      purple: {red: 128, green: 0, blue: 128},
      yellow: {red: 128, green: 128, blue: 0},
      green: {red: 0, green: 128, blue: 0},
      blue: {red: 0, green: 0, blue: 128},
      black: {red: 0, green: 0, blue: 0},
      gray: {red: 105, green: 105, blue: 105},
      // orange: {red: 255, green: 245, blue: 238},
      white: {red: 255, green: 255, blue: 255}
    }

    var classifyAlbum = function (album) {
      var colorInfo = album.cover.colorInfo;
        // THRESHOLD = 50;

      var hsl = rgbToHsl(colorInfo.red, colorInfo.green, colorInfo.blue);
      var color;
      var hue = hsl[0] * 360;
      var saturation = hsl[1];
      var lightness = hsl[2];

      if (lightness>=0.9 && lightness<= 1) {
        color = 'white';
      } else if (lightness>=0 && lightness<= 0.1) {
        color = 'black';
      } else if (saturation <= 0.1) {
        color = 'gray';
      } else if (hue <= 10 || hue >= 350 ) {
        color = 'red';
      } else if (hue >= 45 && hue <= 60 ) {
        color = 'yellow'
      } else if (hue >= 80 && hue <= 140 ) {
        color = 'green';
      } else if (hue >= 175 && hue <= 260 ) {
        color = 'blue';
      } else if (hue >= 290 && hue <= 310 ) {
        color = 'purple'
      }

      if (color) {
        album.cover.class = color;
        store.updateAlbumInfo(album)
      }

      // for(var prop in colorCollection) {
      //   if(colorCollection.hasOwnProperty(prop)) {
      //     var dist = calculateColorDistance(colorCollection[prop], colorInfo);
      //     if(dist < THRESHOLD) {
      //       album.cover.class = prop;
      //       break;
      //     }
      //   }
      // }

      // console.log(album);
      return ;
    }

    var processAlbum = function (album) {
      // var date = new Date(album['date']);
      // var albumCluse = 'album:' + album['title'];
      // var artistCluse = 'artist:' + album['artist'];
      // var yearCluse = 'year:' + date.getFullYear();
      //
      // var q = [albumCluse, artistCluse].join('+')
      //

      var chucks = album['itunes_link'].split('?')[0];
      var chucks2 = chucks.split('/');
      var itunesId = chucks2[chucks2.length - 1].replace('id', '');


      getiTunesInfoById(itunesId).then(function(albumData){
        var img;

        if (!albumData) return;

        albumData.cover = {
          url: albumData['artwork'],
          colorInfo: {}
        }

        img = new Image(100, 100);

        img.crossOrigin = "Anonymous";

        img.onload = function(e) {
          if(!img.src) return;
          var colorThief = new ColorThief(),
          colorInfo = colorThief.getColor(img, 1);
          albumData.cover.colorInfo.red = colorInfo[0];
          albumData.cover.colorInfo.green = colorInfo[1];
          albumData.cover.colorInfo.blue = colorInfo[2];
          classifyAlbum(albumData, colorCollection);
        }

        img.src = albumData.cover.url;
        classifyAlbum(albumData);


      });

    };

    var processAlbums = function (albums){
      var albums = _.shuffle(albums);
      var task = $interval(function(){
        var album = albums.pop();
        processAlbum(album);
        if(albums.length === 0) {
          $rootScope.is_worker_running = false;
        }
      }, 4000, albums.length);
    }

    var init = function() {
      if ($rootScope.is_worker_running) {
        return;
      }

      $rootScope.is_worker_running = true;

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
