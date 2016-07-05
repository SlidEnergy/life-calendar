calendarModule.controller('calendarCtrl', [ '$scope', '$window', '$location', function($scope, $window, $location){

	var WEEK_COUNT_IN_YEAR = 52;
	var MONTH_COUNT_IN_YEAR = 12;
	var YEAR_COUNT = 90;
	//var WEEK_COUNT = COL_COUNT * ROW_COUNT;

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

	if(~$location.$$path.indexOf('week'))
		$scope.lifeCalendarType = 'Неделя';
	else
		$scope.lifeCalendarType = 'Месяц';

	loadPeriods();

	$scope.changeCalendarView = function (e) {

		if(e.value == 'Неделя')
		{
			$window.location.href = '#/week';
		}
		else
		{
			$window.location.href = '#/month';
		}
	};

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
}]);