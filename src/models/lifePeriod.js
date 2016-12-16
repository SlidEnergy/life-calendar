(function () {
	"use strict";

	angular.module('calendar')
    	.factory('LifePeriod', function(){ return LifePeriod; });

	function LifePeriod(originalPeriod, text, start, end, color, type, birthday, withoutFuture, dateFormatter)
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

			var startYear = this.start.getFullYear() - birthday.getFullYear();
			var weeksToStart = GetWeeksToDate(this.start);

			var end = this.end;

			// Если конечная дата не указана, значит период равен 1 дню.
			if(end === undefined)
				end = this.start;

			// Периоды заканчивающиеся в будущем рисуем до текущей даты
			if(withoutFuture && end > new Date())
				end = new Date();

			var endYear = end.getFullYear() - birthday.getFullYear();
			var weeksToEnd = GetWeeksToDate(end);

			return { startYear: startYear, weeksToStart: weeksToStart, endYear: endYear, weeksToEnd: weeksToEnd };
		}

		function GetWeeksToDate(date) {

			return Math.floor(Math.abs((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)));
		}
	}
})();