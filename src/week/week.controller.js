function weekCtrl($scope) {

	var WEEK_COUNT_IN_YEAR = 52;
	var YEAR_COUNT = 90;

	generateBricks();

	$scope.view.updateCalendar = function() {
		generateBricks();
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
				bricks[i][j] = { year: i, brick: j };

				if(i === 0 && (j + 1) % 5 === 0)
					bricks[i][j].brickTooltip = j + 1;
			}
		}

		return bricks;
	}

	function generateBricks()
	{
		var bricks = generateEmptyBricksGrid();

		generatePeriods(bricks);

		generateImportantDates(bricks);

		$scope.bricks = bricks;
	}

	function generatePeriods(bricks) {

		var checkedPeriodTypes = [];

		if ($scope.periodTypeItems[0].value)
			checkedPeriodTypes.push($scope.PeriodType.Basic);

		if ($scope.periodTypeItems[1].value)
			checkedPeriodTypes.push($scope.PeriodType.Finance);

		if ($scope.periodTypeItems[2].value)
			checkedPeriodTypes.push($scope.PeriodType.Carrier);

		if ($scope.periodTypeItems[3].value)
			checkedPeriodTypes.push($scope.PeriodType.Future);

		for(var w = 0; w < $scope.list.length; w++)
		{
			var week = $scope.list[w];

			// Показываем только отмеченные типы
			if (week.type !== undefined && week.type !== null && checkedPeriodTypes.indexOf(week.type) < 0)
				continue;

			if(week.start === undefined)
				continue;

			if($scope.withoutFuture && $scope.list[w].start > new Date())
				continue;

			var startYear = $scope.list[w].start.getFullYear() - $scope.birthday.getFullYear();
			var weeksToStart = GetWeeksToDate($scope.list[w].start);

			var end = $scope.list[w].end;

			if(end === undefined)
				end = new Date();

			if($scope.withoutFuture && end > new Date())
				end = new Date();

			var endYear = end.getFullYear() - $scope.birthday.getFullYear();
			var weeksToEnd = GetWeeksToDate(end);

			for(var i = startYear; i <= endYear; i++)
			{
				for(var j = 0; j < WEEK_COUNT_IN_YEAR; j++)
				{
					if((startYear == endYear && j >= weeksToStart && j <= weeksToEnd) ||
						(startYear != endYear && ((i == startYear && j >= weeksToStart) || (i == endYear && j <= weeksToEnd) || (i > startYear && i < endYear))))
					{
						if(bricks[i][j].weeks === undefined)
							bricks[i][j].weeks = [];

						bricks[i][j].weeks.push(week);

						if(bricks[i][j].data === undefined)
							bricks[i][j].data = {};

						bricks[i][j].data.start = week.start;
						bricks[i][j].data.end = week.end;

						bricks[i][j].data.text = week.text;

						(function(weeks) {

							if(weeks.length == 1)
							{
								bricks[i][j].data.color = week.color;
								bricks[i][j].data.size = '100%';
								return;
							}

							var colors = [];

							for(var k = 0; k < weeks.length; k++)
								if(weeks[k].type != $scope.PeriodType.Basic)
									colors.push(weeks[k].color);

							switch(colors.length)
							{
								case 1: 
									bricks[i][j].data.color = week.color;
									bricks[i][j].data.size = '100%';
									return;
								case 2: 
									bricks[i][j].data.color = '-webkit-linear-gradient(top, ' + colors[0] +', ' + colors[0] + ' 50%, ' + colors[1] + ' 50%, ' + colors[1] +')';
									bricks[i][j].data.size = '100%';
									return;
								case 3: 
									bricks[i][j].data.color = '-webkit-linear-gradient(top, ' + colors[0] +', ' + colors[0] + ' 33%, ' + colors[1] + ' 33%, ' + colors[1] +' 66%, ' + colors[2] + ' 66%, ' + colors[2] + ')';
									bricks[i][j].data.size = '100% 50%, 100% 100%';
									return;
								case 4: 
									bricks[i][j].data.color = '-webkit-linear-gradient(top, ' + colors[0] +', ' + colors[0] + ' 25%, ' + colors[1] + ' 25%, ' + colors[1] +' 50%, ' + colors[2] + ' 50%, ' + colors[2] + ' 75%, ' + colors[3] + ' 75%, ' + colors[3] + ')';
									// bricks[i][j].data.color = '-webkit-linear-gradient(left, ' + colors[0] +', ' + colors[0] + ' 50%, ' + colors[1] + ' 50%, ' + colors[1] +'), ' +
									// 	'-webkit-linear-gradient(left, ' + colors[2] +', ' + colors[2] + ' 50%, ' + colors[3] + ' 50%, ' + colors[3] +')';
									bricks[i][j].data.size = '100% 50%, 100% 50%';
									return;
							}
						})(bricks[i][j].weeks);

						if(bricks[i][j].data.title === undefined)
							bricks[i][j].data.title = periodToString(bricks[i][j].data);
						else
							bricks[i][j].data.title = bricks[i][j].data.title + '\r\n' + periodToString(bricks[i][j].data);
						
						bricks[i][j].data.type = week.type;

						if(week.type == $scope.PeriodType.Basic)
							bricks[i][j].data.outline = '2px solid ' + bricks[i][j].data.color;
					}
				}
			}

			if(week.type == $scope.PeriodType.Basic)
			{
				var averageYearOfPeriod = Math.floor((endYear + startYear)/2);

				bricks[averageYearOfPeriod].basicLabel = week.text;
				bricks[averageYearOfPeriod].basicColor = LightenDarkenColor(week.color, -100);
			}
		}
	}

	function generateImportantDates(bricks) {

		var weeksToBirthday = GetWeeksToDate($scope.birthday);
		var weeksToToday = GetWeeksToDate(new Date());

		bricks[0][weeksToBirthday].importantTooltip = Globalize.dateFormatter()($scope.birthday) + ' : День рождения';
		bricks[new Date().getFullYear() - $scope.birthday.getFullYear()][weeksToToday].importantTooltip = Globalize.dateFormatter()(new Date()) + ' : Сегодня';
	}

	function GetWeeksToDate(date) {

		return Math.floor(Math.abs((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)));
	}

	function periodToString(period)
	{
		var end = period.end;

		if (end === undefined)
			end = new Date();

		var string = Globalize.dateFormatter()(period.start) + ' - ' + Globalize.dateFormatter()(end);

		if(period.text !== undefined)
			string += ' : ' + period.text;

		return string;
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