'use strict';

// Define the `weatherByTomApp` module
var weatherByTomApp = angular.module('weatherByTomApp', [
  'ngResource',
  'ngAnimate',
  'ngRoute',
  'angularMoment',
  'LocalStorageModule',
  'core',
  'weather',
  'about',
  'purpose'
])

.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
})

weatherByTomApp.controller('MainController', function($scope, localStorageService) {
})

weatherByTomApp.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
