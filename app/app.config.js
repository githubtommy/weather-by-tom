'use strict';

angular.
  module('weatherByTomApp')
  .config(['$locationProvider' ,'$routeProvider', 'localStorageServiceProvider',
    function config($locationProvider, $routeProvider, localStorageServiceProvider) {
      $locationProvider.hashPrefix('')
      localStorageServiceProvider.setPrefix("weather-by-tom")
      localStorageServiceProvider.setStorageType("sessionStorage")
      localStorageServiceProvider.setNotify(true, true)
      // If local storage not supported, fall back on cookies: these settings probably only work on localhost
      localStorageServiceProvider.setStorageCookie(45, '/', false)
      localStorageServiceProvider.setStorageCookieDomain('')

      $routeProvider.
        when('/home', {
          template: '<weather></weather>'
        }).
        when('/about', {
          template: '<about></about>'
        }).
        when('/purpose', {
          template: '<purpose></purpose>'
        }).
        when('', {
          template: '<weather></weather>'
        }).
        otherwise('/home');
    }
  ]);
