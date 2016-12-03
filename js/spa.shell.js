spa.shell = (function (){
		// Переменные в обдасти видимости модуля
	var 
		configMap = {
			anchor_schema_map: {
				chat:{ open: true, closed: false}
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
				+ '<div class = "spa-shell-foot">'
				+ 	'<div class = "spa-shell-chat"></div>'
				+ 	'<div class = "spa-shell-modal"></div>'
				+ '</div>',
			chat_extend_time   : 1000,
			chat_retract_time  : 300,
			chat_extend_height : 450,
			chat_retract_height: 15,

			chat_extend_title: 'Щелкните, чтобы свернуть',
			chat_retract_title: 'Щелкните, чтобы раскрыть' 
		},
		stateMap = {
			$container : null,
			anchor_map: {},
			is_chat_retracted : true
		},
		jqueryMap = {},

		copyAnchorMap, setJqueryMap, toggleChat,
		changeAnchorPart, onHashchange, onClickChat, initModule;

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
				$container : $container,
				$chat : $container.find('.spa-shell-chat')
			};
		};

			// Метод toggleChat
			// Назначение: свернуть/развернуть окно чата
			// Аргументы: 
			//		do_extend - если true раскрыть окно, если false свернуть
			//		callback - необязательная функция, которая вызывается в конце анимации
			// Пареметры:
			//		chat_extend_time, chat_retract_time, 
			//		chat_extend_height, chat_retract_height
			// Возвращает: булево значение
			//  	true  - анимация чата начата
			//		false - анимация чата не начата
			// Состояние: устанавливает stateMap.is_chat_retracted
			//      true  - окно свергуто
			//		false - окно раскрыто
		toggleChat = function (do_extend, callback) {
			var 
				px_chat_ht = jqueryMap.$chat.height(),
				is_open = px_chat_ht === configMap.chat_extend_height,
				is_closed = px_chat_ht === configMap.chat_retract_height,
				is_sliding = !is_open && !is_closed;

				if(is_sliding){return false};

				// раскрытие окна чата
				if(do_extend){
					jqueryMap.$chat.animate(
						{height : configMap.chat_extend_height},
						configMap.chat_extend_time,
						function () {
							jqueryMap.$chat.attr(
								'title', configMap.chat_extend_title
							);
							stateMap.is_chat_retracted = false;
							if(callback){callback(jqueryMap.$chat)}
						}
					);
					return true;
				}
				// закрытие окна чата
				jqueryMap.$chat.animate(
					{height : configMap.chat_retract_height},
					configMap.chat_retract_time,
					function () {
						jqueryMap.$chat.attr(
							'title', configMap.chat_retract_title
							);
							stateMap.is_chat_retracted = true;
						if(callback){callback(jqueryMap.$chat)}
					}					
				);
				return true;
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
				anchor_map_previous = copyAnchorMap(),
				anchor_map_porposed,
				_s_chat_previous, _s_chat_porposed,
				s_chat_porposed;

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
					case 'open':
						toggleChat(true);
					break;
					case 'closed':
						toggleChat(false);
					break;
					default:
						toggleChat(false);
						delete anchor_map_porposed.chat;
						$.uriAnchor.setAnchor( anchor_map_porposed, null, true);
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

	// Открытые методы
			// Метод initModule
		initModule = function ($container) {
			stateMap.$container = $container;
			$container.html(configMap.main_html);
			setJqueryMap();

			// интициализировать окно чата и привязать обработчик щелчка
			stateMap.is_chat_retracted = true;
			jqueryMap.$chat
				.attr('title', configMap.chat_retract_title)
				.click(onClickChat);

			// настраиваем uriAnchor 
			$.uriAnchor.configModule({
				schema_map : configMap.uri_schema_map
			});

			// настраиваем функциональные модули
			spa.chat.configModule({});
			spa.chat.initModule(jqueryMap.$chat);

			// обрабатываем соытия изменения якоря 
			$(window)
				.bind('hashchange', onHashchange)
				.trigger('hashchange');
		};

		return {initModule : initModule};
}());