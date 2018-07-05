'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
module('weather').
component('weather', {
  templateUrl: 'weather/weather.template.html',
  controller: ['$scope', 'WeatherByCity', 'WeatherByZip', '$resource', '$http', 'localStorageService',

    function WeatherController($scope, WeatherByCity, WeatherByZip, $resource, $http, localStorageService) {

      var localStorageSupported = localStorageService.isSupported
      if (localStorageSupported) {
        console.log("LOCAL STORAGE IS SUPPORTED");
      } else {
        console.log("LOCAL STORAGE IS NOT SUPPORTED");
      }

      $scope.today = null;
      $scope.forecast = null;
      $scope.forecastGrouped = {};
      $scope.forecastDisplayValues = [];
      $scope.querySuccessful = false;
      $scope.todayReady = false;
      $scope.forecastReady = false;
      $scope.selectedLocation;
      $scope.selectedLocationInProgress = false;
      $scope.weatherNow;
      $scope.weatherForecast;
      $scope.savedCityList;
      $scope.haveCityToSave = false;
      $scope.dataProviders = {};
      $scope.dataProviders.cities = [{
        cityId: "London"
      }, {
        cityId: "New York"
      }, {
        cityId: "Paris"
      }, {
        cityId: "Tokyo"
      }]

      $scope.now = moment();

      $scope.init = function() {
        console.log("init");
        $scope.selectedLocation = $scope.dataProviders.cities[0].cityId;
        // $scope.fetchWeatherData();
        $scope.getSavedCities();
      }

      $scope.shouldSaveButtonBeDisabled = function() {
        var result = true;
        if ($scope.haveCityToSave) {
          var newCity = $scope.today.name;
          if ($scope.savedCityList) {
            var cityAlreadySaved = $scope.savedCityList.indexOf(newCity) > -1
            result = cityAlreadySaved
          } else {
            result = false;
          }
        }
        return result
      }

      $scope.clearSelectedLocation = function() {
        console.log("clearSelectedLocations");
        $scope.selectedLocation = null;
        $scope.selectedLocationInProgress = true;
      }

      // Read locations from local storage
      $scope.getSavedCities = function() {
        var cityString = localStorageService.get("cities")
        if (cityString) {
          $scope.savedCityList = cityString.split(',');
        }

      }

      $scope.saveCity = function() {
        console.log("saveCity");
        var cityString
        var cityList
        var newCity = $scope.today.name
        var doSave = false
        cityString = localStorageService.get("cities");
        if (!cityString) {
          cityString = newCity
          doSave = true
        } else {
          cityList = cityString.split(',');
          if (cityList.indexOf(newCity) == -1) {
            cityList.push(newCity)
            cityString = cityList.join()
            doSave = true
          }
        }

        if (doSave) {
          localStorageService.set("cities", cityString)
        }
        // Confirm
        cityString = localStorageService.get("cities")
        $scope.savedCityList = cityList
        $scope.haveCityToSave = false
      }

      $scope.updateSaveCityButton = function() {

      }

      $scope.getCityDisplayName = function() {
        if ($scope.today && $scope.today.sys) {
          return $scope.today.name + " " + $scope.today.sys.country;
        }
      }

      $scope.getTemperatureForToday = function() {
        if ($scope.today && $scope.today && $scope.today.main) {

          var num = $scope.convertToFarenheit($scope.today.main.temp)
          return String(num)
        }
      }

      $scope.getDescriptionForToday = function() {
        if ($scope.today && $scope.today.weather) {
          return $scope.today.weather[0].main;
        }
      }

      $scope.getCloudinessForToday = function() {
        if ($scope.today && $scope.today.clouds) {
          return $scope.today.clouds.all + "% cloudy"
        }
      }

      // $scope.getDate = function() {
      //   var dateFormat = "MMM DD, YYYY"
      //   return moment().format("MMM DD YYYY")
      // }

      $scope.convertToFarenheit = function(value) {
        return Math.round(value * 9 / 5 + 32)
      }

      $scope.fetchWeatherData = function() {
        $scope.queryToday()
        $scope.queryForecast()
      }

      $scope.queryToday = function() {
        var param = $scope.selectedLocation
        var isZip = $scope.isNumber(param);
        $scope.todayReady = false;

        $scope.querySuccessful = false;
        var self = this;

        if (isZip) {
          $scope.today = WeatherByZip.queryWeather({
            location: $scope.selectedLocation
          });
        } else {
          $scope.today = WeatherByCity.queryWeather({
            location: $scope.selectedLocation
          });
        }

        $scope.today.$promise.then(function(result) {
          $scope.todayReady = true;
          $scope.haveCityToSave = true;
          $scope.querySuccessful = true;
          $scope.today.iconClass = $scope.getIcon($scope.today.weather[0].id)
        });
      }

      $scope.queryForecast = function() {
        $scope.forecastReady = false;
        $scope.querySuccessful = false;
        $scope.location = "Tokyo";
        $scope.forecast = WeatherByCity.queryForecast({
          location: $scope.selectedLocation
        });

        $scope.forecast.$promise.then(function(result) {
          $scope.forecastReady = true;
          $scope.haveCityToSave = true;
          $scope.weatherNow = null;
          $scope.weatherForecast = result;
          $scope.querySuccessful = true;
          $scope.processForecast(result)
        });
      }

      $scope.processForecast = function() {
        $scope.forecastDisplayValues = [];
        $scope.forecastGrouped = {};
        var dayCount = 0;
        var dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        var item;
        var date;
        var day;
        var dayOfYear;
        var dayOfYearPrev;
        var temps = []
        var dayObject;
        var DayObjectBlank = {
          dayName: null,
          dateOfMonth: null,
          description: null,
          tempLow: null,
          tempHigh: null,
          humidity: null,
          wind: null,
          barometer: null,
          iconClass: null
        }

        var startingNewDay = false;
        var isFinalDay = false

        var max = $scope.forecast.list.length;
        var newGroupBegins = false;
        console.log("max:", max);
        for (var i = 0; i < max; i++) {

          item = $scope.forecast.list[i];
          date = moment(item.dt_txt);
          day = date.day();
          dayOfYearPrev = dayOfYear;
          dayOfYear = date.dayOfYear();
          item.dayOfYear = dayOfYear
          item.dayName = dayNames[day];
          item.dateOfMonth = date.date();

          startingNewDay = !$scope.forecastGrouped[dayOfYear]
          isFinalDay = i == max - 1;

          if (startingNewDay || isFinalDay) {

            // First, finish off the previous day if there is one
            if (dayObject) {
              dayObject.tempHigh = temps[0];
              dayObject.tempLow = temps[temps.length - 1];
              $scope.forecastDisplayValues.push(dayObject)
              temps.sort();
              temps = [];
              $scope.forecastGrouped[dayOfYearPrev].push(item)
            }

            // Second, start new day
            $scope.forecastGrouped[dayOfYear] = [];
            dayCount++
            dayObject = Object.create(DayObjectBlank)
            dayObject.dayName = item.dayName;
            dayObject.dateOfMonth = item.dateOfMonth;
            dayObject.description = item.weather[0].main
            dayObject.humidity = item.main.humidity + "% Humidity"
            dayObject.wind = $scope.buildWindDisplay(item.wind.deg, item.wind.speed)
            dayObject.barometer = item.main.pressure;
            dayObject.iconClass = $scope.getIcon(item.weather[0].id)
              // console.log("dayObject.iconClass:", dayObject.iconClass);
          } else {
            temps.push($scope.convertToFarenheit(item.main.temp))
          }
          $scope.forecastGrouped[dayOfYear].push(item)
        }
      }

      $scope.buildWindDisplay = function(degrees, speed) {
        return speed + " / " + degrees;
      }

      // code = weather[0].id
      $scope.getIcon = function(code) {
        var prefix = 'wi wi-';
        // var code = resp.weather[0].id;
        var icon = $scope.weatherIcons[code].icon;

        // If we are not in the ranges mentioned above, add a day/night prefix.
        if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
          icon = 'day-' + icon;
        }

        // Finally tack on the prefix.
        icon = prefix + icon;

        return icon
      }

      $scope.isNumber = function isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
      }

      $scope.weatherIcons = {
        "200": {
          "label": "thunderstorm with light rain",
          "icon": "storm-showers"
        },

        "201": {
          "label": "thunderstorm with rain",
          "icon": "storm-showers"
        },

        "202": {
          "label": "thunderstorm with heavy rain",
          "icon": "storm-showers"
        },

        "210": {
          "label": "light thunderstorm",
          "icon": "storm-showers"
        },

        "211": {
          "label": "thunderstorm",
          "icon": "thunderstorm"
        },

        "212": {
          "label": "heavy thunderstorm",
          "icon": "thunderstorm"
        },

        "221": {
          "label": "ragged thunderstorm",
          "icon": "thunderstorm"
        },

        "230": {
          "label": "thunderstorm with light drizzle",
          "icon": "storm-showers"
        },

        "231": {
          "label": "thunderstorm with drizzle",
          "icon": "storm-showers"
        },

        "232": {
          "label": "thunderstorm with heavy drizzle",
          "icon": "storm-showers"
        },

        "300": {
          "label": "light intensity drizzle",
          "icon": "sprinkle"
        },

        "301": {
          "label": "drizzle",
          "icon": "sprinkle"
        },

        "302": {
          "label": "heavy intensity drizzle",
          "icon": "sprinkle"
        },

        "310": {
          "label": "light intensity drizzle rain",
          "icon": "sprinkle"
        },

        "311": {
          "label": "drizzle rain",
          "icon": "sprinkle"
        },

        "312": {
          "label": "heavy intensity drizzle rain",
          "icon": "sprinkle"
        },

        "313": {
          "label": "shower rain and drizzle",
          "icon": "sprinkle"
        },

        "314": {
          "label": "heavy shower rain and drizzle",
          "icon": "sprinkle"
        },

        "321": {
          "label": "shower drizzle",
          "icon": "sprinkle"
        },

        "500": {
          "label": "light rain",
          "icon": "rain"
        },

        "501": {
          "label": "moderate rain",
          "icon": "rain"
        },

        "502": {
          "label": "heavy intensity rain",
          "icon": "rain"
        },

        "503": {
          "label": "very heavy rain",
          "icon": "rain"
        },

        "504": {
          "label": "extreme rain",
          "icon": "rain"
        },

        "511": {
          "label": "freezing rain",
          "icon": "rain-mix"
        },

        "520": {
          "label": "light intensity shower rain",
          "icon": "showers"
        },

        "521": {
          "label": "shower rain",
          "icon": "showers"
        },

        "522": {
          "label": "heavy intensity shower rain",
          "icon": "showers"
        },

        "531": {
          "label": "ragged shower rain",
          "icon": "showers"
        },

        "600": {
          "label": "light snow",
          "icon": "snow"
        },

        "601": {
          "label": "snow",
          "icon": "snow"
        },

        "602": {
          "label": "heavy snow",
          "icon": "snow"
        },

        "611": {
          "label": "sleet",
          "icon": "sleet"
        },

        "612": {
          "label": "shower sleet",
          "icon": "sleet"
        },

        "615": {
          "label": "light rain and snow",
          "icon": "rain-mix"
        },

        "616": {
          "label": "rain and snow",
          "icon": "rain-mix"
        },

        "620": {
          "label": "light shower snow",
          "icon": "rain-mix"
        },

        "621": {
          "label": "shower snow",
          "icon": "rain-mix"
        },

        "622": {
          "label": "heavy shower snow",
          "icon": "rain-mix"
        },

        "701": {
          "label": "mist",
          "icon": "sprinkle"
        },

        "711": {
          "label": "smoke",
          "icon": "smoke"
        },

        "721": {
          "label": "haze",
          "icon": "day-haze"
        },

        "731": {
          "label": "sand, dust whirls",
          "icon": "cloudy-gusts"
        },

        "741": {
          "label": "fog",
          "icon": "fog"
        },

        "751": {
          "label": "sand",
          "icon": "cloudy-gusts"
        },

        "761": {
          "label": "dust",
          "icon": "dust"
        },

        "762": {
          "label": "volcanic ash",
          "icon": "smog"
        },

        "771": {
          "label": "squalls",
          "icon": "day-windy"
        },

        "781": {
          "label": "tornado",
          "icon": "tornado"
        },

        "800": {
          "label": "clear sky",
          "icon": "sunny"
        },

        "801": {
          "label": "few clouds",
          "icon": "cloudy"
        },

        "802": {
          "label": "scattered clouds",
          "icon": "cloudy"
        },

        "803": {
          "label": "broken clouds",
          "icon": "cloudy"
        },

        "804": {
          "label": "overcast clouds",
          "icon": "cloudy"
        },


        "900": {
          "label": "tornado",
          "icon": "tornado"
        },

        "901": {
          "label": "tropical storm",
          "icon": "hurricane"
        },

        "902": {
          "label": "hurricane",
          "icon": "hurricane"
        },

        "903": {
          "label": "cold",
          "icon": "snowflake-cold"
        },

        "904": {
          "label": "hot",
          "icon": "hot"
        },

        "905": {
          "label": "windy",
          "icon": "windy"
        },

        "906": {
          "label": "hail",
          "icon": "hail"
        },

        "951": {
          "label": "calm",
          "icon": "sunny"
        },

        "952": {
          "label": "light breeze",
          "icon": "cloudy-gusts"
        },

        "953": {
          "label": "gentle breeze",
          "icon": "cloudy-gusts"
        },

        "954": {
          "label": "moderate breeze",
          "icon": "cloudy-gusts"
        },

        "955": {
          "label": "fresh breeze",
          "icon": "cloudy-gusts"
        },

        "956": {
          "label": "strong breeze",
          "icon": "cloudy-gusts"
        },

        "957": {
          "label": "high wind, near gale",
          "icon": "cloudy-gusts"
        },

        "958": {
          "label": "gale",
          "icon": "cloudy-gusts"
        },

        "959": {
          "label": "severe gale",
          "icon": "cloudy-gusts"
        },

        "960": {
          "label": "storm",
          "icon": "thunderstorm"
        },

        "961": {
          "label": "violent storm",
          "icon": "thunderstorm"
        },

        "962": {
          "label": "hurricane",
          "icon": "cloudy-gusts"
        }
      }

      $scope.init();


    }
  ]
});
