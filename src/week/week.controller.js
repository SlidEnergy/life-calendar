function weekCtrl($scope) {

	var WEEK_COUNT_IN_YEAR = 52;
	var YEAR_COUNT = 90;

	var dateFormatter = Globalize.dateFormatter();

	generateBricks();

	$scope.view.updateCalendar = function() {
		generateBricks();
	};

	$scope.popupedBrick = {};
	$scope.visiblePopup = false;

	$scope.showInfo = function (brick) {
    	$scope.popupedBrick = brick;
    	$scope.visiblePopup = true;
	};

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
				var date = new Date($scope.birthday.getFullYear() + i, 0, 1);
				date.setDate(date.getDate() + j * 7);

				var stringDate = dateFormatter(date);

				bricks[i][j] = { year: i, brick: j, date: stringDate, title: stringDate};
				
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

	function LifePeriod(text, start, end, color, type)
	{
		this.text = text;
		this.start = start;
		this.end = end;
		this.color = color;
		this.type = type;

		this.test = function(a,b) {
			return a+b;
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
	}

	function createLifePeriod(period) {
		return new LifePeriod(period.text, period.start, period.end, period.color, period.type);
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

			var startYear = period.start.getFullYear() - $scope.birthday.getFullYear();
			var weeksToStart = GetWeeksToDate(period.start);

			var end = period.end;

			// Если конечная дата не указана, значит период равен 1 дню.
			if(end === undefined)
				end = period.start;

			// Периоды заканчивающиеся в будущем рисуем до текущей даты
			if($scope.withoutFuture && end > new Date())
				end = new Date();

			var endYear = end.getFullYear() - $scope.birthday.getFullYear();
			var weeksToEnd = GetWeeksToDate(end);

			for(var i = startYear; i <= endYear; i++)
			{
				for(var j = 0; j < WEEK_COUNT_IN_YEAR; j++)
				{
					var brick = bricks[i][j];

					if((startYear == endYear && j >= weeksToStart && j <= weeksToEnd) ||
						(startYear != endYear && ((i == startYear && j >= weeksToStart) || (i == endYear && j <= weeksToEnd) || (i > startYear && i < endYear))))
					{
						if(brick.weeks === undefined)
							brick.weeks = [];

						brick.weeks.push(period);

						// Устанавливаем цвет для ячеек
						setColor(brick, period, brick.weeks);

						// Устанавливаем всплывающюю подсказку
						brick.title = brick.title + '\r\n' + period;
						
						brick.type = period.type;

						if(period.type == $scope.PeriodType.Basic)
							brick.outline = '2px solid ' + brick.color;
					}
				}
			}

			// Устанавливаем сноски для базовых периодов
			setLabelForBasic(bricks, period, startYear, endYear);
		}
	}
	
	function setLabelForBasic(bricks, period, startYear, endYear)
	{
		if(period.type == $scope.PeriodType.Basic)
		{
			var averageYearOfPeriod = Math.floor((endYear + startYear)/2);

			bricks[averageYearOfPeriod].labelForBasic = period.text;
			bricks[averageYearOfPeriod].colorForBasic = LightenDarkenColor(period.color, -100);
		}
	}

	function setColor(brick, period, weeks)
	{
		if(period.end === undefined || +period.start == +period.end)
		{
			brick.border = '2px solid ' + period.color;
			return;
		}

		if(weeks.length == 1)
		{
			brick.color = period.color;
			brick.size = '100%';
			return;
		}

		var colors = [];

		for(var k = 0; k < weeks.length; k++)
			if(weeks[k].type != $scope.PeriodType.Basic)
				colors.push(weeks[k].color);

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