function weekCtrl($scope) {

	var WEEK_COUNT_IN_YEAR = 52;
	var YEAR_COUNT = 90;

	var dateFormatter = Globalize.dateFormatter();

	$scope.dateFormatter = dateFormatter;

	generateBricks();

	$scope.view.updateCalendar = function() {
		// Обновляем календарь

		generateBricks();
	};

	$scope.showPopup = function (event, brick) {
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
	};

	$scope.prolongPeriod = function(brick, period) {

		var date = new Date($scope.birthday.getFullYear() + brick.year, 0, 1);
		date.setDate(date.getDate() + brick.week * 7);

    	period.prolongPeriod(date);

		brick.addPeriod(period);

		$scope.popup.prevPeriods = getPrevPeriods(brick, $scope.bricks);

		$scope.changeCalendarSettings();
	};

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
				bricks[i].yearTooltip = i;

			for(var j = 0; j < WEEK_COUNT_IN_YEAR; j++)
			{
				bricks[i][j] = new LifeBrick(i, j);
				
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

		generateImportantDates(bricks);

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

	function LifePeriod(originalPeriod, text, start, end, color, type)
	{
		this.originalPeriod = originalPeriod;
		this.text = text;
		this.start = start;
		this.end = end;
		this.color = color;
		this.type = type;

		this.pos = _getCalendarPosition.apply(this);

		this.prolongPeriod = function(date) {
			this.end = date;
			this.originalPeriod.end = date;
			this.pos = _getCalendarPosition.apply(this);
		};

		this.toString = function()
		{
			var end = this.end;

			var string = dateFormatter(this.start);

			if (end !== undefined && +this.start != +end)
				string += ' - ' + dateFormatter(end);

			if(this.text !== undefined)
				string += ' : ' + this.text;

			return string;
		};

		function _getCalendarPosition() {

			if(this.start === undefined)
				return;

			var startYear = this.start.getFullYear() - $scope.birthday.getFullYear();
			var weeksToStart = GetWeeksToDate(this.start);

			var end = this.end;

			// Если конечная дата не указана, значит период равен 1 дню.
			if(end === undefined)
				end = this.start;

			// Периоды заканчивающиеся в будущем рисуем до текущей даты
			if($scope.withoutFuture && end > new Date())
				end = new Date();

			var endYear = end.getFullYear() - $scope.birthday.getFullYear();
			var weeksToEnd = GetWeeksToDate(end);

			return { startYear: startYear, weeksToStart: weeksToStart, endYear: endYear, weeksToEnd: weeksToEnd };
		}
	}

	function createLifePeriod(period) {
		return new LifePeriod(period, period.text, period.start, period.end, period.color, period.type);
	}

	function LifeBrick(year, week) {

		this.year = year;
		this.week = week;

		var date = getDateFromCalendarPosition(this.year, this.week);

		this.date = date;
		this.stringDate = dateFormatter(date);
		this.title = dateFormatter(date);

		this.periods = [];

		this.addPeriod = function(period) {

			this.periods.push(period);

			// Устанавливаем цвет для ячеек
			setColor(this, period, this.periods);

			// Устанавливаем всплывающюю подсказку
			this.title = this.title + '\r\n' + period;
			
			this.type = period.type;

			if(period.type == $scope.PeriodType.Basic)
				this.outline = '2px solid ' + this.color;
		}

		this.valueOf = function() {
			return year * week;
		};
	}

	function getDateFromCalendarPosition(year, week) {
		
		var date = new Date($scope.birthday.getFullYear() + year, 0, 1);
		date.setDate(date.getDate() + week * 7);

		return date;
	}

	function generatePeriods(bricks, periods, checkedPeriodTypes) {
		
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

			// Устанавливаем сноски для базовых периодов
			setLabelForBasic(bricks, period);
		}
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

	function setColor(brick, period, periods)
	{
		if(period.end === undefined || +period.start == +period.end)
		{
			brick.border = '2px solid ' + period.color;
			return;
		}

		if(periods.length == 1)
		{
			brick.color = period.color;
			brick.size = '100%';
			return;
		}

		var colors = [];

		for(var k = 0; k < periods.length; k++)
			if(periods[k].type != $scope.PeriodType.Basic)
				colors.push(periods[k].color);

		switch(colors.length)
		{
			case 1: 
				brick.color = period.color;
				return;
			case 2: 
				brick.color = '-webkit-linear-gradient(top, ' + colors[0] +', ' + colors[0] + ' 50%, ' + colors[1] + ' 50%, ' + colors[1] +')';
				return;
			case 3: 
				brick.color = '-webkit-linear-gradient(top, ' + colors[0] +', ' + colors[0] + ' 33%, ' + colors[1] + ' 33%, ' + colors[1] +' 66%, ' + colors[2] + ' 66%, ' + colors[2] + ')';
				return;
			case 4: 
				brick.color = '-webkit-linear-gradient(top, ' + colors[0] +', ' + colors[0] + ' 25%, ' + colors[1] + ' 25%, ' + colors[1] +' 50%, ' + colors[2] + ' 50%, ' + colors[2] + ' 75%, ' + colors[3] + ' 75%, ' + colors[3] + ')';
				return;
		}
	}

	function generateImportantDates(bricks) {

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
}