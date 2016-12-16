(function () {
	'use strict';

	angular.module('calendar')
		.controller('weekCtrl', [ '$scope', 'LifePeriod', 'LifeBrick', weekCtrl]);

	function weekCtrl($scope, LifePeriod, LifeBrick) {

		var WEEK_COUNT_IN_YEAR = 52;
		var YEAR_COUNT = 90;

		var dateFormatter = Globalize.dateFormatter();

		$scope.dateFormatter = dateFormatter;
		$scope.dateLabelInit = dateLabelInit;
		$scope.showPopup = showPopup;
		$scope.prolongPeriod = prolongPeriod;
		$scope.view.updateCalendar = updateCalendar;
		$scope.leftPeriodLabels = [];

		generateBricks();

		function updateCalendar() {
			// Обновляем календарь

			generateBricks();
		}

		function showPopup(event, brick) {
			// Показываем всплывающее окно

			// Удаляем класс brick-popuped с предыдущего элемента
			if($scope.popup !== undefined && $scope.popup.brick != brick)
				$($scope.popup.element).removeClass('brick-popuped');

			// Добавляем класс brick-popup, чтобы к элементу можно было спозиционировать всплывающее окно
			$(event.target).addClass('brick-popuped');

			// Данные для всплывающего окна
	    	$scope.popup = {
	    		brick: brick,
	    		element: event.target,
	    		prevPeriods: getPrevPeriods(brick, $scope.bricks) 
	    	};

	    	// Показываем всплывающее окно
	    	$scope.visiblePopup = true;
		}

		function prolongPeriod(brick, period) {

			var date = new Date($scope.birthday.getFullYear() + brick.year, 0, 1);
			date.setDate(date.getDate() + brick.week * 7);

	    	period.prolongPeriod(date);

			brick.addPeriod(period);

			$scope.popup.prevPeriods = getPrevPeriods(brick, $scope.bricks);

			$scope.changeCalendarSettings();
		}

		function getPrevPeriods(brick, bricks) {
			
			var prevBrick = getPrevBrick(brick, bricks);

	    	var prevPeriods = [];

	    	for(var i=0; i<prevBrick.periods.length; i++)
	    	{
	    		var period = prevBrick.periods[i];

	    		if(period.type != $scope.PeriodType.Basic && period.pos.endYear == prevBrick.year && period.pos.weeksToEnd == prevBrick.week)
	    			prevPeriods.push(period);
	    	}

	    	return prevPeriods;
		}

		function getPrevBrick(brick, bricks) {

			var year = brick.year;
			var week = brick.week;

			if(week === 0)
				return bricks[year - 1][WEEK_COUNT_IN_YEAR - 1];
			else
				return bricks[year][week - 1];
		}

		function generateEmptyBricksGrid()
		{
			var bricks = [];

			for(var i = 0; i < YEAR_COUNT; i++)
			{
				bricks[i] = [];

				if(i % 5 === 0)
					bricks[i].yearTooltip = ($scope.birthday.getFullYear() + i) + 'г. (' + i + 'лет)';

				for(var j = 0; j < WEEK_COUNT_IN_YEAR; j++)
				{
					bricks[i][j] = new LifeBrick(i, j, $scope.birthday, $scope.dateFormatter);
					
					if(i === 0 && (j + 1) % 5 === 0)
						bricks[i][j].brickTooltip = j + 1;
				}
			}

			return bricks;
		}

		function generateBricks()
		{
			var bricks = generateEmptyBricksGrid();

			var checkedPeriodTypes = getCheckedPeriodTypes();

			generatePeriods(bricks, $scope.list, checkedPeriodTypes);

			addTodayAndBirthdayToBricks(bricks);

			$scope.bricks = bricks;
		}

		function getCheckedPeriodTypes()
		{
			var checkedPeriodTypes = [];

			if ($scope.periodTypeItems[0].value)
				checkedPeriodTypes.push($scope.PeriodType.Basic);

			if ($scope.periodTypeItems[1].value)
				checkedPeriodTypes.push($scope.PeriodType.Finance);

			if ($scope.periodTypeItems[2].value)
				checkedPeriodTypes.push($scope.PeriodType.Carrier);

			if ($scope.periodTypeItems[3].value)
				checkedPeriodTypes.push($scope.PeriodType.Future);

			if ($scope.periodTypeItems[4].value)
				checkedPeriodTypes.push($scope.PeriodType.Private);

			return checkedPeriodTypes;
		}

		function createLifePeriod(period) {
			return new LifePeriod(period, period.text, period.start, period.end, period.color, period.type, $scope.birthday, $scope.withoutFuture, dateFormatter);
		}

		function generatePeriods(bricks, periods, checkedPeriodTypes) {
			
			var leftPeriodLabels = [];

			for(var p = 0; p < periods.length; p++)
			{
				var period = createLifePeriod(periods[p]);

				// Показываем только отмеченные типы
				if (period.type !== undefined && period.type !== null && checkedPeriodTypes.indexOf(period.type) < 0)
					continue;

				// Не показываем периоды без даты начала
				if(period.start === undefined)
					continue;

				// Не показываем периоды в будущем
				if($scope.withoutFuture && period.start > new Date())
					continue;

				for(var i = period.pos.startYear; i <= period.pos.endYear; i++)
				{
					for(var j = 0; j < WEEK_COUNT_IN_YEAR; j++)
					{
						var brick = bricks[i][j];

						if((period.pos.startYear == period.pos.endYear && j >= period.pos.weeksToStart && j <= period.pos.weeksToEnd) || 
							(period.pos.startYear != period.pos.endYear && ((i == period.pos.startYear && j >= period.pos.weeksToStart) || (i == period.pos.endYear && j <= period.pos.weeksToEnd) || (i > period.pos.startYear && i < period.pos.endYear))))
						{
							brick.addPeriod(period);
						}
					}
				}

				// Устанавливаем сноски справа для базовых периодов.
				setLabelForBasic(bricks, period);

				// Добавляем для одиночных дат сноски слева в отдельный массив.
				if(period.type != $scope.PeriodType.Basic && +period.start == +period.end)
					leftPeriodLabels.push({ text: period.text, color: LightenDarkenColor(period.color, -100), period: period});
			}

			// Сортируем сноски слева
			leftPeriodLabels.sort(function(a, b) {
    			return +a.period.start - +b.period.start;
			});

			$scope.leftPeriodLabels = leftPeriodLabels;
		}
		
		function setLabelForBasic(bricks, period)
		{
			if(period.type == $scope.PeriodType.Basic)
			{
				var averageYearOfPeriod = Math.floor((period.pos.endYear + period.pos.startYear)/2);

				bricks[averageYearOfPeriod].labelForBasic = period.text;
				bricks[averageYearOfPeriod].colorForBasic = LightenDarkenColor(period.color, -100);
			}
		}

		function addTodayAndBirthdayToBricks(bricks) {

			var weeksToBirthday = GetWeeksToDate($scope.birthday);
			var weeksToToday = GetWeeksToDate(new Date());

			bricks[0][weeksToBirthday].importantTooltip = dateFormatter($scope.birthday) + ' : День рождения';
			bricks[new Date().getFullYear() - $scope.birthday.getFullYear()][weeksToToday].importantTooltip = dateFormatter(new Date()) + ' : Сегодня';
		}

		function GetWeeksToDate(date) {

			return Math.floor(Math.abs((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)));
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

		function dateLabelInit(event) {

		}
	}
})();