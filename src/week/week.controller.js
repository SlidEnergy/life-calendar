calendarModule.controller('weekCtrl', [ '$scope', function($scope){

	var WEEK_COUNT_IN_YEAR = 52;
	var YEAR_COUNT = 90;

	generateBricks();

	$scope.view.updateCalendar = function() {
		generateBricks();
	}

	function generateEmptyBricksGrid()
	{
		var bricks = [];

		for(var i = 0; i < YEAR_COUNT; i++)
		{
			bricks[i] = [];

			if(i % 5 == 0)
			bricks[i].yearTooltip = i;

			for(var j = 0; j < WEEK_COUNT_IN_YEAR; j++)
			{
				bricks[i][j] = { year: i, brick: j };

				if(i ==0 && (j + 1) % 5 == 0)
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

			if (week.type !== undefined && week.type != null && checkedPeriodTypes.indexOf(week.type) < 0)
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
					if(startYear == endYear)
					{
						if(j >= weeksToStart && j <= weeksToEnd)
						{
							bricks[i][j].data = $scope.list[w];
							bricks[i][j].data.title = periodToString(bricks[i][j].data);
							
							if(week.type == $scope.PeriodType.Basic)
								bricks[i][j].data.outline = '2px solid ' + bricks[i][j].data.color;
						}
					}
					else
					{
						if((i == startYear && j >= weeksToStart) || (i == endYear && j <= weeksToEnd) || (i > startYear && i < endYear))
						{
							bricks[i][j].data = $scope.list[w];
							bricks[i][j].data.title = periodToString(bricks[i][j].data);

							if(week.type == $scope.PeriodType.Basic)
								bricks[i][j].data.outline = '2px solid ' + bricks[i][j].data.color;
						}
					}
				}
			}

			if(week.type == $scope.PeriodType.Basic)
			{
				var averageYearOfPeriod = Math.floor((endYear - startYear)/2);

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
}]);