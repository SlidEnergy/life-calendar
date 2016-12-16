(function () {
	"use strict";

	$.when(
		$.get("vendor/cldr/main/ru/numbers.json"),
		$.get("vendor/cldr/main/ru/timeZoneNames.json"),
		$.get("vendor/cldr/main/ru/ca-gregorian.json"),
		$.get("vendor/cldr/supplemental/likelySubtags.json"),	
		$.get("vendor/cldr/supplemental/timeData.json"),
		$.get("vendor/cldr/supplemental/weekData.json"),
		$.get("vendor/cldr/supplemental/numberingSystems.json")
	).then(function(){
		//The following code converts the got results into an array
		return [].slice.apply( arguments, [0] ).map(function( result ) {
				return result[ 0 ];
		});
	}).then(
		Globalize.load //loads data held in each array item to Globalize
	).then(function(){

		//initialize your application here

		Globalize.locale(navigator.language || navigator.browserLanguage);	

		angular.bootstrap($('body'), ['calendar']);
	});

	// var app = angular.module('app', ['calendar']);

	var calendarModule = angular.module('calendar', ['dx', 'ngRoute'])
		.config(['$routeProvider', '$locationProvider',
		  function($routeProvider, $locationProvider) {
			 $routeProvider
				.when('/week', { 
					templateUrl: 'week/week.html',
					controller: 'weekCtrl',
					controllerAs: 'week'
				})
				.when('/month', {
					templateUrl: 'month/month.html',
					controller: 'monthCtrl',
					controllerAs: 'month'
				});

			$routeProvider.otherwise({redirectTo: '/week'});

			 // $locationProvider.html5Mode(true);
		}]);
})();