function calendarCtrl($scope, $window, $location) {

	var PeriodType = {
		Basic: 0,
		Finance: 1,
		Carrier: 2,
		Future: 3
	};

	$scope.PeriodType = PeriodType;

	$scope.list = [];

	// TODO: переделать из jquery подхода в angular
	$scope.cellTemplate = function (cellElement, cellInfo) {
		$(cellElement).css('background-color', cellInfo.value);
	};
	$scope.editCellTemplate = function (cellElement, cellInfo) {
		cellElement.dxColorBox({ 
			value: cellInfo.value, 
			onValueChanged: function (e) { cellInfo.setValue(e.value); }});
	};

	$scope.birthday = new Date(1987, 6, 30);
	$scope.birthdayMin = new Date(1900, 0, 1);
	$scope.birthdayMax = new Date();

	var periodTypeItems = [];

	for (var prop in PeriodType) {
		periodTypeItems.push({ id: PeriodType[prop], name: prop, value: true });
	}

	$scope.periodTypeItems = periodTypeItems;

	$scope.withoutFuture = true;

	$scope.lifeCalendarTypeItems = ['Неделя', 'Месяц'];

	if(~$location.$$path.indexOf('week'))
		$scope.lifeCalendarType = 'Неделя';
	else
		$scope.lifeCalendarType = 'Месяц';

	loadPeriods();

	$scope.changeCalendarView = function (e) {

		if(e.value == 'Неделя')
			$window.location.href = '#/week';
		else
			$window.location.href = '#/month';
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

		localStorage.setItem('Periods', JSON.stringify($scope.list));
	}

	$scope.changeCalendarSettings = function() {
		
		savePeriods();

		$scope.view.updateCalendar();
	};

	// Интерфейс для View
	$scope.view = { updateCalendar: function() {} };
}