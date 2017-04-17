(function () {
	'use strict';

	angular.module('calendar')
		.controller('calendarCtrl', [ '$scope', '$window', '$location', '$firebaseAuth', calendarCtrl]);

	function calendarCtrl($scope, $window, $location, $firebaseAuth) {

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
		$scope.lifeCalendarType = ($location.$$path === '' || ~$location.$$path.indexOf('week')) ? 'Неделя' : 'Месяц';
		$scope.isAuthorized = null;
		$scope.signupAndSaveCalendar = signupAndSaveCalendar;
		$scope.signout = signout;
		$scope.isSignupPopupVisible = false;
		$scope.signupCancel_Click = signupCancel_Click;
		$scope.signupOk_Click = signupOk_Click;
		$scope.signupEmail = "";
		$scope.signupPassword = "";
		$scope.signupErrorMessage = "";
		$scope.signupAndLoadData = signupAndLoadData;

		var signupAndSaveClicked = false;
		var userId = null;

		$firebaseAuth().$onAuthStateChanged(auth_StateChanged);

		$scope.changeCalendarView = function (e) {

			if(e.value == 'Неделя')
				$window.location.href = '#/week';
			else
				$window.location.href = '#/month';
		};

		function auth_StateChanged(user) {
			$scope.$apply(function() {
				if (user) {
					var displayName = user.displayName;
					var email = user.email;
					var emailVerified = user.emailVerified;
					var photoURL = user.photoURL;
					var isAnonymous = user.isAnonymous;
					var providerData = user.providerData;

					userId = user.uid;

					$scope.isAuthorized = true;

					if(signupAndSaveClicked) {
						signupAndSaveClicked = false;
						savePeriods();
					}
					else
						loadDataFromServer();
				} else {
					$scope.isAuthorized = false;

					loadDataFromLocalStorage();
				}

				$scope.isSignupPopupVisible = false;
			});
		}

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

		function loadDataFromLocalStorage() {

			var periods = JSON.parse(localStorage.getItem('periods'), function(key, value) {
				
				if (key == 'start' || key == 'end')
						return new Date(value);

				return value;
			});

			if (periods)
				$scope.list = periods;

			var birthday = JSON.parse(localStorage.getItem('birthday'), function(key, value) { return new Date(value); });

			if(birthday)
				$scope.birthday = birthday;

			if(!periods || periods.length == 0) {

				var result = DevExpress.ui.dialog.confirm(
					'Добро пожаловать в "Календарь жизни", где вы можете взглянуть на свою жизнь на одном экране.<br><br>Вы хотите загрузить пример?',
					 "Календарь жизни");
				
				result.done(function (dialogResult) {
					if(dialogResult)
						loadSample();
				});
			}
		}

		function loadDataFromServer() {

			if($scope.isAuthorized) {
				firebase.database().ref('/lifecalendar/' + userId).once('value').then(function(snapshot) {
					$scope.$apply(function() {	
						var data = snapshot.val();

						if(data) {
							var periods = JSON.parse(data.periods, function(key, value) {
								
								if (key == 'start' || key == 'end')
										return new Date(value);

								return value;
							});

							if (periods)
								$scope.list = periods;

							var birthday = JSON.parse(data.birthday, function(key, value) { return new Date(value); });

							if(birthday)
								$scope.birthday = birthday;

							$scope.view.dataLoaded.resolve();
						}
					});
				});
			}
		}

		function savePeriods() {

			localStorage.setItem('periods', JSON.stringify($scope.list));

			localStorage.setItem('birthday', JSON.stringify($scope.birthday));

			if($scope.isAuthorized) {
				firebase.database().ref('lifecalendar/' + userId).set({
					periods: JSON.stringify($scope.list),
					birthday: JSON.stringify($scope.birthday)
				});
			}
		}

		$scope.changeCalendarSettings = function() {
			
			savePeriods();
		};

		$scope.updateCalendar = function() {
			savePeriods();
			$scope.view.updateCalendar();	
		};

		function loadSample() {

			$scope.$apply(function() {
				
				$scope.list = JSON.parse(
					'[{"text":"Детство","start":"1987-07-29T14:00:00.000Z","end":"1994-08-30T14:00:00.000Z","color":"#fff89c","type":0},{"text":"Школа","start":"1994-08-31T14:00:00.000Z","end":"2004-06-24T14:00:00.000Z","color":"#ffe58f","type":0},{"text":"Институт","start":"2004-08-31T14:00:00.000Z","end":"2009-06-24T14:00:00.000Z","color":"#ffcf6e","type":0},{"text":"Карьера","start":"2009-10-31T14:00:00.000Z","end":"2047-07-29T14:00:00.000Z","color":"#fcd1ae","type":0},{"text":"МИАЦ","start":"2009-10-31T14:00:00.000Z","end":"2011-02-19T14:00:00.000Z","color":"#ff9494","type":2},{"text":"LERS","start":"2011-02-20T14:00:00.000Z","end":"2017-03-25T14:00:00.000Z","color":"#ff9442","type":2},{"text":"Трейдинг","start":"2016-04-14T14:00:00.000Z","end":"2017-03-25T14:00:00.000Z","color":"#5ba655","type":1},{"text":"Ремонт квартиры","start":"2014-04-05T14:00:00.000Z","end":"2014-11-05T14:00:00.000Z","color":"#7db2c7","type":1},{"text":"Посуточная аренда","start":"2014-04-14T14:00:00.000Z","end":"2014-11-14T14:00:00.000Z","color":"#eaff00","type":1},{"text":"Питер, контейнеры","start":"2014-06-14T14:00:00.000Z","end":"2014-09-14T14:00:00.000Z","color":"#d396ff","type":1},{"text":"Life Calendar","start":"2016-06-09T14:00:00.000Z","end":"2016-07-07T14:00:00.000Z","color":"#ffef0f","type":2,"date":"2016-07-07T14:00:00.000Z"},{"text":"Трип по Азии","start":"2015-11-26T14:00:00.000Z","end":"2016-01-07T14:00:00.000Z","color":"#fff200","type":4},{"text":"Таиланд","start":"2014-11-26T14:00:00.000Z","end":"2014-12-11T14:00:00.000Z","color":"#ffea00","type":4},{"text":"Питер, Сочи","start":"2015-04-27T14:00:00.000Z","end":"2015-05-16T14:00:00.000Z","color":"#ffee00","type":4},{"text":"Пенсия","start":"2047-08-29T14:00:00.000Z","end":"2051-07-30T14:00:00.000Z","color":"#ffbfbf","type":0},{"text":"Сахалин","start":"2016-03-05T14:00:00.000Z","end":"2016-03-08T14:00:00.000Z","color":"#ffee00","type":4},{"text":"Купил машину","start":"2011-11-14T14:00:00.000Z","end":"2011-11-14T14:00:00.000Z","color":"#ff0000","type":4},{"text":"Купил квартиру","start":"2014-04-05T14:00:00.000Z","end":"2014-04-05T14:00:00.000Z","color":"#ff0000","type":1},{"text":"Свадьба","start":"2015-08-27T14:00:00.000Z","end":"2015-08-27T14:00:00.000Z","color":"#ff0000","type":4},{"__KEY__":"3c14338a-d668-a799-c2a1-8db335ced266","start":"2014-04-05T14:00:00.000Z","text":"Съехал от родителей","color":"#ff0000","type":4,"end":"2014-04-05T14:00:00.000Z"},{"__KEY__":"7122afd7-9edc-7b8a-c841-1ca470bc8aac","start":"2016-08-05T14:00:00.000Z","end":"2016-08-19T14:00:00.000Z","text":"Байкал","color":"#ffee2e","type":4},{"__KEY__":"b93bcc55-5bdc-474c-2370-db3da76cdbc2","start":"2016-08-28T14:00:00.000Z","end":"2017-03-04T14:00:00.000Z","text":"Квартира-студия","type":1,"color":"#ff5757"},{"__KEY__":"2c6d746c-c97c-4c94-586d-9879d9ca0be0","start":"2016-09-30T14:00:00.000Z","end":"2016-10-17T14:00:00.000Z","text":"Mapala.net","type":2,"color":"#ba70ff"},{"__KEY__":"46c3d422-99b0-e538-20a3-911bfab6fdd1","start":"2014-06-14T14:00:00.000Z","text":"Первая инвестиция","type":1,"end":"2014-06-14T14:00:00.000Z","color":"#ff0000"},{"__KEY__":"8c3195b3-461e-7ba7-1769-d9b2df7d81b6","start":"2014-04-14T14:00:00.000Z","text":"Первый бизнес","type":1,"end":"2014-04-14T14:00:00.000Z","color":"#ff0000"},{"__KEY__":"dacbe100-6c3a-1c4e-b693-ea1ea3657879","start":"2016-10-11T14:00:00.000Z","end":"2016-10-11T14:00:00.000Z","text":"Купил квартиру-студию","color":"#ff0000","type":1},{"__KEY__":"47b17579-6322-148e-c9b9-8d5ae797b699","start":"2016-10-21T14:00:00.000Z","end":"2016-10-21T14:00:00.000Z","text":"Первая инвестиция в криптовалюту","color":"#ff0000","type":1},{"__KEY__":"d3d484d4-197b-a714-8d29-8c1842621d35","start":"2016-11-08T14:00:00.000Z","end":"2016-11-08T14:00:00.000Z","text":"Первая инвестиция в фондовый рынок","color":"#ff0000","type":1},{"__KEY__":"b6d63cdb-a594-9b0a-819c-4b7756b7111a","start":"2017-07-29T14:00:00.000Z","end":"2017-07-29T14:00:00.000Z","text":"Выйти на пассивный доход в 30 тыс в месяц","type":3,"color":"#00b825"},{"__KEY__":"d998589f-d77a-3364-87f1-712742bf83af","start":"2017-02-05T14:00:00.000Z","end":"2017-02-05T14:00:00.000Z","text":"Переезд в новую квартиру","type":4,"color":"#ff0000"},{"__KEY__":"7bc9119c-5533-f61b-d411-280e2cf668e9","start":"2017-02-18T14:00:00.000Z","end":"2017-02-18T14:00:00.000Z","text":"Закончить Ремонт","color":"#c170ff","type":3},{"__KEY__":"52841dcb-4917-1752-3db9-ef3818a9dc48","start":"2022-07-29T14:00:00.000Z","end":"2022-07-29T14:00:00.000Z","text":"Свой дом","color":"#3aad00","type":3},{"__KEY__":"524c3da5-357b-b201-7483-81dd41969bcc","start":"2019-07-29T14:00:00.000Z","end":"2019-07-29T14:00:00.000Z","text":"Свой участок для постройки дома","color":"#00b049","type":3}]',
					function(key, value) {
						if (key == 'start' || key == 'end')
								return new Date(value);

						return value;
				});

				$scope.birthday = new Date(1987, 6, 30)

				$scope.view.dataLoaded.resolve();
			});
		}

		function signupAndSaveCalendar() {

			$scope.isSignupPopupVisible = true;
			
			signupAndSaveClicked = true;
		}

		function signupAndLoadData() {
			
			if($scope.list && $scope.list.length > 0) {
				var result = DevExpress.ui.dialog.confirm(
					'Текущие данные будут потеряны. Чтобы сохранить текущие данные нажмите "Нет" и воспользуйтесь ссылкой под кнопкой "Применить".<br><br>Все равно загрузить данные?',
					 "Загрузить данные");
				
				result.done(function (dialogResult) {
					if(dialogResult)
						$scope.$apply(function() {
							$scope.isSignupPopupVisible = true;
						});
				});
			}
			else
				$scope.isSignupPopupVisible = true;
		}

		function createUser(email, password) {

			firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
			  // Handle Errors here.
			  var errorCode = error.code;
			  var errorMessage = error.message;
			  // ...
			  $scope.$apply(function() {
					$scope.signupErrorMessage = error.message;
				});
			});
		}

		function signup(email, password) {

			// sigh in
			firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
			  
				if(errorCode == "auth/user-not-found")
				{
					createUser(email, password);
					return
				}

				$scope.$apply(function() {
					$scope.signupErrorMessage = error.message;
				});
			});
		}

		function signout() {
			 firebase.auth().signOut().then(function() {
				$scope.isAuthorized = false;
			   // Sign-out successful.
			 }).catch(function(error) {
			   // An error happened.
			 });
		}

		function signupCancel_Click() {
			$scope.signupErrorMessage = "";
			$scope.isSignupPopupVisible = false;
		}

		function signupOk_Click() {
			$scope.signupErrorMessage = "";
			signup($scope.signupEmail, $scope.signupPassword);
		}

		// Интерфейс для View
		$scope.view = { 
			updateCalendar: function() {},
			dataLoaded: $.Deferred()
		};
	}
})();