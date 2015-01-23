'use strict';

angular.module('colorRelease')
  .controller('MainCtrl', function ($scope, coverService) {
    coverService.init();
  });
