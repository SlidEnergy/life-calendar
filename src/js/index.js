"use strict";

var COL_COUNT = 52;
var ROW_COUNT = 90;
var WEEK_COUNT = COL_COUNT * ROW_COUNT;

var PeriodType = {
		Basic: 0,
		Finance: 1,
		Carrier: 2,
		Future: 3
}

var list = [];

$.when(
		$.get("vendor/cldr/supplemental/likelySubtags.json"),
		$.get("vendor/cldr/main/ru/numbers.json"),
		$.get("vendor/cldr/main/ru/currencies.json"),
		$.get("vendor/cldr/main/ru/ca-gregorian.json"),
		$.get("vendor/cldr/supplemental/timeData.json"),
		$.get("vendor/cldr/supplemental/weekData.json"),
		$.get("vendor/cldr/supplemental/currencyData.json"),
		$.get("vendor/cldr/supplemental/numberingSystems.json")
).then(function(){
		//The following code converts the got results into an array
		return [].slice.apply( arguments, [0] ).map(function( result ) {
				return result[ 0 ];
		});
}).then(
		Globalize.load //loads data held in each array item to Globalize
).then(function(){

	//initialize your application here

	Globalize.locale(navigator.language || navigator.browserLanguage);
		
	$('#birthday').dxDateBox({
			value: new Date(1987, 6, 30),
			max: new Date(),
			min: new Date(1900, 0, 1),
	});

	var enumsObj = [];
	for (var prop in PeriodType) {
			enumsObj.push({ Id: PeriodType[prop], Name: prop })
	}

	for (var i = 0; i < enumsObj.length; i++) {
			$("<div class='checkbox' id='" + enumsObj[i].Name + "-checkbox'></div>").appendTo('#types').dxCheckBox({
					value: true,
					text: enumsObj[i].Name
			});
	}

	$('#without-future').dxCheckBox({
			value: false,
			text: "Не показывать будущее"
	});

	$("#life-calendar-type").dxRadioGroup({
			items: ["Неделя", "Месяц"],
			value: "Неделя",
			layout: "horizontal"
	});

	$('#apply').dxButton({
			text: "Применить",
			onClick: updateLife
	});

	loadPeriods();

	var dataGrid = $("#grid-container").dxDataGrid({
			dataSource: list,
			paging: {
					enabled: false
			},
			groupPanel: {
					visible: true
			},
			editing: {
					mode: "cell",
					allowUpdating: true,
					allowDeleting: true,
					allowAdding: true
			},
			onRowUpdated: function () {
					savePeriods();
			},
			onRowRemoved: function () {
					savePeriods();
			},
			onRowInserted: function () {
					savePeriods();
			},
			columns: [{
					dataField: "start",
					caption: "Начало",
					dataType: "date",
					width: 100
			},
			{
					dataField: "end",
					caption: "Конец",
					dataType: "date",
					width: 100
			},
			{
					dataField: "text",
					caption: "Название"
			},
			{
					dataField: "color",
					caption: "Цвет",
					dataType: "color",
					width: 130,
					cellTemplate: function (cellElement, cellInfo) {
							$(cellElement)
									.css('background-color', cellInfo.value)
					},
					editCellTemplate: function (cellElement, cellInfo) {
							cellElement.dxColorBox({
									value: cellInfo.value,
									onValueChanged: function (e) {
											cellInfo.setValue(e.value);
									}
							});
					}
			},
			{
					dataField: "type",
					caption: "Тип",
					width: 100,
					groupIndex: 0,
					showWhenGrouped: true,
					lookup: {
							dataSource: enumsObj,
							displayExpr: "Name",
							valueExpr: "Id"
					}
			}]
	}).dxDataGrid("instance");

	for (var i = 0; i < WEEK_COUNT; i++)
			$('.life').append('<div class="week"></div>');
});

function add_click() {

	var startBox = $('#start-period').dxDateBox('instance');
	var endBox = $('#end-period').dxDateBox('instance');
	var descriptionBox = $('#description-period').dxTextBox('instance');
	var colorBox = $('#color-period').dxColorBox('instance');
	var typeBox = $('#type-period').dxSelectBox('instance');

	var start = startBox.option('value');
	var end = endBox.option('value');
	var text = descriptionBox.option('value');
	var color = colorBox.option('value');
	var type = typeBox.option('value');

	add(start, end, text, color, type);

	//startBox.option('value', new Date());
	//endBox.option('value', new Date());
	descriptionBox.option('value', '');
	//colorBox.option('value', '#ffff00');
	//typeBox.option('value', 0);

	savePeriods();
	updateSelect();
}

function remove_click() {

	var text = $("select option:selected").text();

	remove(text);

	savePeriods();
	updateSelect();
}

function edit_click() {

		var start = $('#start-period').dxDateBox('instance').option('value');
		var end = $('#end-period').dxDateBox('instance').option('value');
		var description = $('#description-period').dxTextBox('instance').option('value');
		var color = $('#color-period').dxColorBox('instance').option('value');
		var type = $('#type-period').dxSelectBox('instance').option('value');

	var selectedText = $("select option:selected").text();

	edit(start, end, description, color, type, selectedText);

	savePeriods();
	updateSelect();
}

function up_click() {

		var selectedText = $("select option:selected").text();

		var selectedIndex;

		$.each(list, function (i, item) {
				if (PeriodToString(item) == selectedText)
						selectedIndex = i;
		});

		if (selectedIndex - 1 < 0)
				return;

		var selectedItem;
		var replacedItem;

		replacedItem = list[selectedIndex - 1];
		selectedItem = list[selectedIndex];
		list[selectedIndex - 1] = selectedItem;
		list[selectedIndex] = replacedItem;

		updateSelect();
}

function down_click() {

		var selectedText = $("select option:selected").text();

		var selectedIndex;

		$.each(list, function (i, item) {
				if (PeriodToString(item) == selectedText)
						selectedIndex = i;
		});

		if (selectedIndex + 1 >= list.length)
				return;

		var selectedItem;
		var replacedItem;

		replacedItem = list[selectedIndex + 1];
		selectedItem = list[selectedIndex];
		list[selectedIndex + 1] = selectedItem;
		list[selectedIndex] = replacedItem;

		updateSelect();
}

function select_change() {

		var selectedText = $("select option:selected").text();

	$.each(list, function (i, item) {
			if (PeriodToString(item) == selectedText)
		{
				$('#start-period').dxDateBox('instance').option('value', item.start);
				$('#end-period').dxDateBox('instance').option('value', item.end);
				$('#description-period').dxTextBox('instance').option('value', item.text);
				$('#color-period').dxColorBox('instance').option('value', item.color);
				$('#type-period').dxSelectBox('instance').option('value', item.type);
		}
	});
}

function add(start, end, text, color, type) {
	list.push({
		start: start,
		end: end,
		text: text,
		color: color,
				type: type
	});
}

function remove(text) {

	list = jQuery.grep(list, function (item) {

			return PeriodToString(item) != text;
	});
}

function edit(start, end, text, color, type, selectedText) {

	$.each(list, function (i, item) {
			if (PeriodToString(item) == selectedText)
		{
			item.start = start;
			item.end = end;
			item.text = text;
			item.color = color;
			item.type = type;
		}
	});
}

function updateSelect() {

	$('select').empty();

	$.each(list, function (i, item) {

			$('select').append($('<option>', {
				text: PeriodToString(item)
		}));
	});
}

function updateLife() {

		var selectedPeriodTypes = [];

		if ($('#Basic-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Basic);

		if ($('#Finance-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Finance);

		if ($('#Carrier-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Carrier);

		if ($('#Future-checkbox').dxCheckBox('instance').option('value'))
				selectedPeriodTypes.push(PeriodType.Future);

		var withoutFuture = $('#without-future').dxCheckBox('instance').option('value');

		// Очищаем календарь

		$('.week').css('background-color', 'white').css('outline', '2px solid white')
				.tooltip({ disabled: true });

		$('.label').remove();

		var birthday = $('#birthday').dxDateBox('instance').option('value');
		var weeksToBirthday = GetWeeksToBirthday(birthday);
		var weeksToNow = GetWeeksFromBirthdayToDate(new Date(), birthday, weeksToBirthday);

	$.each(list, function (i, item) {

			if (~selectedPeriodTypes.indexOf(item.type)) {

					var weeksToStart = GetWeeksFromBirthdayToDate(item.start, birthday, weeksToBirthday);
					var weeksToEnd;

					if(item.end === undefined)
						weeksToEnd = weeksToNow;
					else
						weeksToEnd = GetWeeksFromBirthdayToDate(item.end, birthday, weeksToBirthday);

						// Не показывать будущее
					if (withoutFuture) {
							// Не рисуем периоды начинающиеся в будущем.
							if (weeksToStart >= weeksToNow)
									return;

							// Рисуем периоды заканчивающие в будущем до сегодняшнего дня.
							if (weeksToEnd > weeksToNow)
									weeksToEnd = weeksToNow;
					}

					$('.week:nth-child(n+' + weeksToStart + '):nth-child(-n+' + weeksToEnd + ')')
								.css('background-color', item.color)
								.tooltip({ items: '.week', content: PeriodToString(item), track: true, disabled: false });

					// Для базовых периодов заполняем фон за клетками.

					if (item.type == PeriodType.Basic) {
							$('.week:nth-child(n+' + weeksToStart + '):nth-child(-n+' + weeksToEnd + ')')
										.css('outline', '2px solid ' + item.color);
					}

						// Для базовых периодов добавляем метки с текстом справа

					if (item.type == PeriodType.Basic) {
							var weeksToMiddlePeriod = Math.floor((weeksToStart + weeksToEnd) / 2);

							$('<div class="label">- ' + item.text + '</div>')
										.appendTo('.week:nth-child(' + weeksToMiddlePeriod + ')')
										.css('color', LightenDarkenColor(item.color, -100));
					}
			}
	});

		// День рождения

		$('.week:nth-child(' + weeksToBirthday + ')')
		.css('border-color', '#0000ff')
		.css('border-width', '2px')
		.tooltip({ items: '.week', content: Globalize.dateFormatter()(birthday) + ' : День рождения', track: true, disabled: false });

		// СегодняdateFormatter

		$('.week:nth-child(' + weeksToNow + ')')
				.css('border-color', '#0000ff')
				.css('border-width', '2px')
				.tooltip({ items: '.week', content: Globalize.dateFormatter()(new Date()) + ' : Сегодня', track: true, disabled: false });
}

function GetWeeksFromBirthdayToDate(date, birthday, weeksToBirthday) {

		if (!birthday) {
				birthday = $('#birthday').dxDateBox('instance').option('value');
				weeksToBirthday = GetWeeksToBirthday(birthday);
		}

		return Math.floor(Math.abs((date - birthday) / (7 * 24 * 60 * 60 * 1000))) + weeksToBirthday;
}

function GetWeeksToBirthday(birthday) {

		if (!birthday)
				birthday = $('#birthday').dxDateBox('instance').option('value');

		return Math.floor(Math.abs((birthday - new Date(birthday.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)));
}

function PeriodToString(period)
{
	var end = period.end;
	if (end === undefined)
		end = new Date();
		return Globalize.dateFormatter()(period.start) + ' - ' + Globalize.dateFormatter()(end) + ' : ' + period.text;
}

function loadPeriods() {

		var periods = JSON.parse(localStorage.getItem('Periods'), function(key, value) {
				if (key == 'start' || key == 'end')
						return new Date(value);

				return value;
		});

		if (periods)
				list = periods;
}

function savePeriods() {

	localStorage.setItem('Periods', JSON.stringify(list));
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