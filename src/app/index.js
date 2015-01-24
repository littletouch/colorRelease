'use strict';

angular.module('colorRelease', ['ngAnimate', 'ngCookies', 'ngTouch',
  'ngSanitize', 'ngResource', 'ngRoute', 'spotify', 'firebase'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
;
