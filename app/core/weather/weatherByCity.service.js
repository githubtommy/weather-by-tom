'use strict';

angular.
module('core.weatherByCity').
factory('WeatherByCity', ['$resource',

  function($resource) {

    // API key is currently unused (work either with or without key)
    var apiKey = '12eab05ca0475a6f0bb12e060a56fbf2';
    var apiBaseUrl = 'http://api.openweathermap.org/data/2.5/';

    return $resource(apiBaseUrl + ':path/:subPath?q=:location', {
      APPID: apiKey,
      mode: 'json',
      callback: 'JSON_CALLBACK',
      units: 'metric',
      lang: 'en'
    }, {
      queryWeather: {
        method: 'JSONP',
        params: {
          path: 'weather'
        },
        isArray: false,
        headers: {
          'x-api-key': apiKey
        }
      },
      queryForecast: {
        method: 'JSONP',
        params: {
          path: 'forecast'
        },
        isArray: false,
        headers: {
          'x-api-key': apiKey
        }
      },
      queryForecastDaily: {
        method: 'JSONP',
        params: {
          path: 'forecast',
          subPath: 'daily',
          cnt: 7
        },
        isArray: false,
        headers: {
          'x-api-key': apiKey
        }
      }
    })
  }





  // function($resource) {
  //   return $resource('phones/:phoneId.json', {}, {
  //     query: {
  //       method: 'GET',
  //       params: {phoneId: 'phones'},
  //       isArray: true
  //     }
  //   });
  // }
]);
