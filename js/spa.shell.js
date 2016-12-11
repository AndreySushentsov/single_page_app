spa.shell = (function (){
		// Переменные в обдасти видимости модуля
	var 
		configMap = {
			anchor_schema_map: {
				chat:{ opened: true, closed: true}
			},
			main_html: String()
				+ '<div class = "spa-shell-head">'
				+ 	'<div class = "spa-shell-head-logo"></div>'
				+ 	'<div class = "spa-shell-head-acct"></div>'
				+ 	'<div class = "spa-shell-head-search"></div>'
				+ '</div>'
				+ '<div class = "spa-shell-main">'
				+ 	'<div class = "spa-shell-main-nav"></div>'
				+ 	'<div class = "spa-shell-main-content"></div>'
				+ '</div>'
				+ '<div class = "spa-shell-foot"></div>'
				+ '<div class = "spa-shell-modal"></div>' 
		},
		stateMap = { anchor_map: {} },
		jqueryMap = {},

		copyAnchorMap, setJqueryMap, changeAnchorPart, onHashchange, setChatAnchor, initModule;

	// Служебные методы
			// Возвращает копию сохраненного хэша якорей
		copyAnchorMap = function () {
			return $.extend(true, {}, stateMap.anchor_map);
		}
	// Методы DOM
			// Начало метода changeAnchorPart
			// Назначение: изменять адрес в URI-адресе
			// Аргументы: 
			//		arg_map - хэш, описывающий, какую часть якоря мы хотим изменить
			// Возвращает: 
			// 		true  - якорь в URI обновлен
			//		false - не удалось обновить якорь в URI
			// Действия: 
			//		Текущая часть якоря сохранена в stateMap.anchorMap().
			//		Этот метод
			//			- Создает копию хэша, вызывая copyAnchorMap()
			//			- Модифицирует пары ключ-значение с помощью arg_map
			//			- Управляет различием между зависимыми и независимыми значениями в кодировке
			//			- Пытается изменить URI, используя uriAnchor
			//			- Возвращает true в случае успеха и false в случае ошибки
			//
		changeAnchorPart = function (arg_map) {
			var
				anchor_map_revise = copyAnchorMap(),
				bool_return = true,
				key_name, key_name_dep;

				// начало изменений в хэше якорей
				KEYVAL:
				for(key_name in arg_map){
					if(arg_map.hasOwnProperty(key_name)){
						//пропустить зависимые ключи
						if(key_name.indexOf('_') === 0){continue KEYVAL;}

						//обновить значение независимого ключа
						anchor_map_revise[key_name] = arg_map[key_name];

						//обновить соответствующий зависимый ключ
						key_name_dep = '_' + key_name;
						if (arg_map[key_name_dep]) {
							anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
						} else{
							delete anchor_map_revise[key_name_dep];
							delete anchor_map_revise['_s' + key_name_dep];
						};
					}
				}		

				// начало попытки обновления URI; в случае ошибки восстановить исходное значение
				try{
					$.uriAnchor.setAnchor(anchor_map_revise);
				}
				catch (error){
					//восстановить исходное состояние в URI
					$.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
					bool_return = false;
				}
			return bool_return;	
		};

			// Метод setJqueryMap
		setJqueryMap = function () {
			var $container = stateMap.$container;
			jqueryMap = {
				$container : $container
			};
		};

	// Обработчики событий

			// Обработчик события onHashchange
			// Назаначение: обрабатывает событие hashchange
			// Аркументы: 
			//		event - обьект события jQuery
			// Параметры: нет
			// Возвращает: false
			// Действие: 
			// 		разбирает якорь в URI
			//		сравнивает предложенное состояние приложения с текущим
			//		вносит изменения только если предложенное состояние отличается от текущего

		onHashchange = function (event) {
			var 
				anchor_map_porposed,
				is_ok = true,
				_s_chat_previous, _s_chat_porposed,
				s_chat_porposed,
				anchor_map_previous = copyAnchorMap();
				// пытаемся разобрать якорь
			try{
				anchor_map_porposed =$.uriAnchor.makeAnchorMap(); 
			}
			catch(error){
				$.uriAnchor.setAnchor(anchor_map_previous, null, true);
				return false;	
			}
			stateMap.anchor_map = anchor_map_porposed;

				// вспомагательные переменные
			_s_chat_previous = anchor_map_previous._s_chat;
			_s_chat_porposed = anchor_map_porposed._s_chat;

				// 	измененме компонента Chat
			if (! anchor_map_previous || _s_chat_previous !== _s_chat_porposed) {
				s_chat_porposed = anchor_map_porposed.chat;
				switch (s_chat_porposed){
					case 'opened':
						is_ok = spa.chat.setSliderPosition('opened');
					break;
					case 'closed':
						is_ok = spa.chat.setSliderPosition('closed');
					break;
					default:
						toggleChat(false);
						delete anchor_map_porposed.chat;
						$.uriAnchor.setAnchor( anchor_map_porposed, null, true);
				}
			};
				// Востановление якоря, если не удалось изменить состояние окна чата
			if (! is_ok) {
				if (anchor_map_previous) {
					$.uriAnchor.setAnchor(anchor_map_previous, null, true);
					stateMap.setAnchor = anchor_map_previous;
				} else {
					delete anchor_map_porposed.chat;
					$.uriAnchor.setAnchor(anchor_map_porposed, null, true);
				}
			};

			return false;
		};

			// Обработчик событий onClickChat
		onClickChat = function (event) {
			changeAnchorPart({
				chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
			});
			return false;
		}
	// Обратные вызовы
			// setChatAnchor
			// Пример : setChatAnchor('closed');
			// Назначение : изменить компонент якоря, относящийся к чату
			// Аргументы : 
			// 		position_type - допустимые значения 'closed', 'opened'
			// Действия : 
			//		заменяет параметр 'chat' в якоре указанным значением,
			//		если это возможно.
			// Возвращает :
			//		true - часть якоря была обновлена
			// 		false - часть якоря не была обновлена
			// Исключения : нет
		setChatAnchor = function (position_type) {
			return changeAnchorPart({ chat : position_type});
		};

	// Открытые методы
			// Метод initModule
			// Пример : spa.chat.initModule($('#div_id')) ;
			// Назначение :
			//		Требует, чтобы Chat начал предоставлять свою функциональность
			//      пользователю.
			// Аргументы: 
			// 		$append_target (example: $('#div_id'));
			//      Коллекция jQuery, которая должна содержать
			//		единственный элемент DOM - контейнер
			// Действие :
			//		Добавляет выплывающий чат в конец указанного контейнера и заполняет
			//		его HTML - содержимым. Затем инициализирует элементы, события и обработчики,
			//		так чтобы предоставить пользователю интерфейс для работы с
			//		комнатой в чате.
			// Возвращает: true в случае успеха иначе false
			// Исключения: none
		initModule = function ($container) {
			stateMap.$container = $container;
			$container.html(configMap.main_html);
			setJqueryMap();

			// интициализировать окно чата и привязать обработчик щелчка
		//	stateMap.is_chat_retracted = true;
		//	jqueryMap.$chat
		//		.attr('title', configMap.chat_retract_title)
		//		.click(onClickChat);

			// настраиваем uriAnchor 
			$.uriAnchor.configModule({
				schema_map : configMap.uri_schema_map
			});

			// настраиваем функциональные модули
			spa.chat.configModule({
				set_chat_anchor : setChatAnchor,
				chat_model      : spa.model.chat,
				people_model    : spa.model.people
			});
			spa.chat.initModule(jqueryMap.$container);

			// обрабатываем соытия изменения якоря 
			$(window)
				.bind('hashchange', onHashchange)
				.trigger('hashchange');
		};

		return {initModule : initModule};
}());