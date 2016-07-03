"use strict";

var calendarModule = angular.module('calendar', ['dx']);

calendarModule.controller('calendarCtrl', [ '$scope', function($scope){

	var COL_COUNT = 52;
	var ROW_COUNT = 90;
	var WEEK_COUNT = COL_COUNT * ROW_COUNT;

	var PeriodType = {
		Basic: 0,
		Finance: 1,
		Carrier: 2,
		Future: 3
	}

	var list = [];

	$scope.list = list;
	$scope.cellTemplate = function (cellElement, cellInfo) {
			$(cellElement)
					.css('background-color', cellInfo.value)
	};
	$scope.editCellTemplate = function (cellElement, cellInfo) {
			cellElement.dxColorBox({
					value: cellInfo.value,
					onValueChanged: function (e) {
							cellInfo.setValue(e.value);
					}
			});
	};

	$scope.birthday = new Date(1987, 6, 30);
	$scope.birthdayMin = new Date(1900, 0, 1);
	$scope.birthdayMax = new Date();

	var enumsObj = [];
	for (var prop in PeriodType) {
			enumsObj.push({ id: PeriodType[prop], name: prop })
	}

	$scope.periodTypeItems = enumsObj;

	$scope.withoutFuture = true;

	$scope.lifeCalendarTypeItems = ['Неделя', 'Месяц'];
	$scope.lifeCalendarType = 'Неделя';

	loadPeriods();

	function updateLife() {

		var selectedPeriodTypes = [];

		if ($('#Basic-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Basic);

		if ($('#Finance-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Finance);

		if ($('#Carrier-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Carrier);

		if ($('#Future-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Future);

		var withoutFuture = $('#without-future').dxCheckBox('instance').option('value');

		// Очищаем календарь

		$('.week').css('background-color', 'white').css('outline', '2px solid white')
				.tooltip({ disabled: true });

		$('.label').remove();

		var birthday = $('#birthday').dxDateBox('instance').option('value');
		var weeksToBirthday = GetWeeksToBirthday(birthday);
		var weeksToNow = GetWeeksFromBirthdayToDate(new Date(), birthday, weeksToBirthday);

		$.each(list, function (i, item) {

				if (~selectedPeriodTypes.indexOf(item.type)) {

						var weeksToStart = GetWeeksFromBirthdayToDate(item.start, birthday, weeksToBirthday);
						var weeksToEnd;

						if(item.end === undefined)
							weeksToEnd = weeksToNow;
						else
							weeksToEnd = GetWeeksFromBirthdayToDate(item.end, birthday, weeksToBirthday);

							// Не показывать будущее
						if (withoutFuture) {
								// Не рисуем периоды начинающиеся в будущем.
								if (weeksToStart >= weeksToNow)
										return;

								// Рисуем периоды заканчивающие в будущем до сегодняшнего дня.
								if (weeksToEnd > weeksToNow)
										weeksToEnd = weeksToNow;
						}

						$('.week:nth-child(n+' + weeksToStart + '):nth-child(-n+' + weeksToEnd + ')')
									.css('background-color', item.color)
									.tooltip({ items: '.week', content: PeriodToString(item), track: true, disabled: false });

						// Для базовых периодов заполняем фон за клетками.

						if (item.type == PeriodType.Basic) {
								$('.week:nth-child(n+' + weeksToStart + '):nth-child(-n+' + weeksToEnd + ')')
											.css('outline', '2px solid ' + item.color);
						}

							// Для базовых периодов добавляем метки с текстом справа

						if (item.type == PeriodType.Basic) {
								var weeksToMiddlePeriod = Math.floor((weeksToStart + weeksToEnd) / 2);

								$('<div class="label">- ' + item.text + '</div>')
											.appendTo('.week:nth-child(' + weeksToMiddlePeriod + ')')
											.css('color', LightenDarkenColor(item.color, -100));
						}
				}
		});

			// День рождения

			$('.week:nth-child(' + weeksToBirthday + ')')
			.css('border-color', '#0000ff')
			.css('border-width', '2px')
			.tooltip({ items: '.week', content: Globalize.dateFormatter()(birthday) + ' : День рождения', track: true, disabled: false });

			// СегодняdateFormatter

			$('.week:nth-child(' + weeksToNow + ')')
					.css('border-color', '#0000ff')
					.css('border-width', '2px')
					.tooltip({ items: '.week', content: Globalize.dateFormatter()(new Date()) + ' : Сегодня', track: true, disabled: false });
	}

	function GetWeeksFromBirthdayToDate(date, birthday, weeksToBirthday) {

			if (!birthday) {
					birthday = $('#birthday').dxDateBox('instance').option('value');
					weeksToBirthday = GetWeeksToBirthday(birthday);
			}

			return Math.floor(Math.abs((date - birthday) / (7 * 24 * 60 * 60 * 1000))) + weeksToBirthday;
	}

	function GetWeeksToBirthday(birthday) {

			if (!birthday)
					birthday = $('#birthday').dxDateBox('instance').option('value');

			return Math.floor(Math.abs((birthday - new Date(birthday.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)));
	}

	function PeriodToString(period)
	{
		var end = period.end;
		if (end === undefined)
			end = new Date();
			return Globalize.dateFormatter()(period.start) + ' - ' + Globalize.dateFormatter()(end) + ' : ' + period.text;
	}

	function loadPeriods() {

			var periods = JSON.parse(localStorage.getItem('Periods'), function(key, value) {
					if (key == 'start' || key == 'end')
							return new Date(value);

					return value;
			});

			if (periods)
					$scope.list = periods;
	}

	function savePeriods() {

		localStorage.setItem('Periods', JSON.stringify(list));
	}

	function LightenDarkenColor(col, amt) {

			var usePound = false;

			if (col[0] == "#") {
					col = col.slice(1);
					usePound = true;
			}

			var num = parseInt(col, 16);

			var r = (num >> 16) + amt;

			if (r > 255) r = 255;
			else if (r < 0) r = 0;

			var b = ((num >> 8) & 0x00FF) + amt;

			if (b > 255) b = 255;
			else if (b < 0) b = 0;

			var g = (num & 0x0000FF) + amt;

			if (g > 255) g = 255;
			else if (g < 0) g = 0;

			return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

	}

	for (var i = 0; i < WEEK_COUNT; i++)
			$('.life').append('<div class="week"></div>');
}]);
 
// var app = angular.module('app', ['calendar']);




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

	// loadPeriods();

	// for (var i = 0; i < WEEK_COUNT; i++)
	// 		$('.life').append('<div class="week"></div>');
});