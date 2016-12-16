(function () {
	"use strict";

	angular.module('calendar')
    	.factory('LifeBrick', function(){ return LifeBrick; });

	function LifeBrick(year, week, birthday, dateFormatter) {

		var PeriodType = {
			Basic: 0,
			Finance: 1,
			Carrier: 2,
			Future: 3,
			Private: 4
		};

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

			if(period.type == PeriodType.Basic)
				this.outline = '2px solid ' + this.color;
		};

		this.valueOf = function() {
			return year * week;
		};

		function getDateFromCalendarPosition(year, week) {
		
			var date = new Date(birthday.getFullYear() + year, 0, 1);
			date.setDate(date.getDate() + week * 7);

			return date;
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
				if(periods[k].type != PeriodType.Basic)
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
	}
})();