function monthCtrl($scope) {

	var MONTH_COUNT_IN_YEAR = 12;
	var YEAR_COUNT = 90;
	//var WEEK_COUNT = COL_COUNT * ROW_COUNT;

	generateBricks();

	function generateBricks()
	{
		var bricks = [];

		for(var i = 0; i < YEAR_COUNT; i++)
		{
			bricks[i] = [];

			if(i % 5 == 0)
			bricks[i].yearTooltip = i;

			for(var j = 0; j < MONTH_COUNT_IN_YEAR; j++)
			{
				bricks[i][j] = { year: i, brick: j };

				if(i ==0 && (j + 1) % 1 == 0)
					bricks[i][j].brickTooltip = j + 1;
			}
		}

		$scope.bricks = bricks;
	}
};