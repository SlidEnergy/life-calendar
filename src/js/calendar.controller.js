function calendarCtrl($scope, $window, $location) {

	var PeriodType = {
		Basic: 0,
		Finance: 1,
		Carrier: 2,
		Future: 3,
		Private: 4
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

	$scope.birthdayMin = new Date(1900, 0, 1);
	$scope.birthdayMax = new Date();

	var periodTypeItems = [];

	for (var prop in PeriodType) {
		periodTypeItems.push({ id: PeriodType[prop], name: getTitleForPeriodType(PeriodType[prop]), value: true });
	}

	$scope.periodTypeItems = periodTypeItems;

	$scope.withoutFuture = true;

	$scope.lifeCalendarTypeItems = ['Неделя', 'Месяц'];

	if($location.$$path === '' || ~$location.$$path.indexOf('week'))
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

	function getTitleForPeriodType(periodType) {
		switch(periodType)
		{
			case PeriodType.Basic: return 'Основа';
			case PeriodType.Finance: return 'Финансы';
			case PeriodType.Carrier: return 'Карьера';
			case PeriodType.Future: return 'Планы';
			case PeriodType.Private: return 'Личное';

			default: return undefined;
		}
	}

	function loadPeriods() {

		var periods = JSON.parse(localStorage.getItem('Periods'), function(key, value) {
			
			if (key == 'start' || key == 'end')
					return new Date(value);

			return value;
		});

		if (periods)
			$scope.list = periods;

		var birthday = JSON.parse(localStorage.getItem('Birthday'), function(key, value) { return new Date(value); });

		if(birthday)
			$scope.birthday = birthday;
	}

	function savePeriods() {

		localStorage.setItem('Periods', JSON.stringify($scope.list));

		localStorage.setItem('Birthday', JSON.stringify($scope.birthday));
	}

	$scope.changeCalendarSettings = function() {
		
		savePeriods();
	};

	$scope.updateCalendar = function() {
		$scope.view.updateCalendar();	
	};

	$scope.loadSample = function() {

		var periods = JSON.parse(
			'[{"text":"Детство","start":"1987-07-29T14:00:00.000Z","end":"1994-08-30T14:00:00.000Z","color":"#fff89c","type":0},{"text":"Школа","start":"1994-08-31T14:00:00.000Z","end":"2004-06-24T14:00:00.000Z","color":"#ffe58f","type":0},{"text":"Институт","start":"2004-08-31T14:00:00.000Z","end":"2009-06-24T14:00:00.000Z","color":"#ffcf6e","type":0},{"text":"Карьера","start":"2009-10-31T14:00:00.000Z","end":"2057-07-29T14:00:00.000Z","color":"#fcd1ae","type":0},{"text":"МИАЦ","start":"2009-10-31T14:00:00.000Z","end":"2011-02-19T14:00:00.000Z","color":"#ff9494","type":2},{"text":"LERS","start":"2011-02-20T14:00:00.000Z","end":"2016-07-14T14:00:00.000Z","color":"#ff9442","type":2},{"text":"Трейдинг","start":"2016-04-14T14:00:00.000Z","end":"2016-07-14T14:00:00.000Z","color":"#5ba655","type":1},{"text":"Ремонт квартиры","start":"2014-04-05T14:00:00.000Z","end":"2014-11-05T14:00:00.000Z","color":"#7db2c7","type":1},{"text":"Посуточная аренда","start":"2014-04-14T14:00:00.000Z","end":"2014-11-14T14:00:00.000Z","color":"#eaff00","type":1},{"text":"Питер, контейнеры","start":"2014-06-14T14:00:00.000Z","end":"2014-09-14T14:00:00.000Z","color":"#d396ff","type":1},{"text":"Life Calendar","start":"2016-06-09T14:00:00.000Z","end":"2016-07-07T14:00:00.000Z","color":"#ffef0f","type":null},{"text":"Трип по Азии","start":"2015-11-26T14:00:00.000Z","end":"2016-01-07T14:00:00.000Z","color":"#fff200","type":4},{"text":"Таиланд","start":"2014-11-26T14:00:00.000Z","end":"2014-12-11T14:00:00.000Z","color":"#ffea00","type":4},{"text":"Питер, Сочи","start":"2015-04-27T14:00:00.000Z","end":"2015-05-16T14:00:00.000Z","color":"#ffee00","type":4},{"text":"Пенсия","start":"2057-08-29T14:00:00.000Z","end":"2073-07-30T14:00:00.000Z","color":"#ffbfbf","type":0},{"text":"Сахалин","start":"2016-03-05T14:00:00.000Z","end":"2016-03-08T14:00:00.000Z","color":"#ffee00","type":4},{"text":"Купил машину","start":"2011-11-14T14:00:00.000Z","end":"2011-11-14T14:00:00.000Z","color":"#ff0000","type":4},{"text":"Купил квартиру","start":"2014-04-05T14:00:00.000Z","end":"2014-04-05T14:00:00.000Z","color":"#ff0000","type":1},{"text":"Свадьба","start":"2015-08-27T14:00:00.000Z","end":"2015-08-27T14:00:00.000Z","color":"#ff0000","type":4},{"start":"2014-04-05T14:00:00.000Z","text":"Съехал от родителей","color":"#ff0000","type":4}]',
			function(key, value) {
				if (key == 'start' || key == 'end')
						return new Date(value);

				return value;
		});

		if (periods)
			$scope.list = periods;

		var birthday = JSON.parse(localStorage.getItem('Birthday'), function(key, value) { return new Date(value); });

		if(birthday)
			$scope.birthday = birthday;
	};

	// Интерфейс для View
	$scope.view = { updateCalendar: function() {} };
}