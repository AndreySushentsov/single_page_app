spa.chat = (function () {
	// Переменные области видимости модуля
	var 
		configMap = {
			main_html : String()
				+'<div style="padding-left: 1em; color: #fff;">'
				+	'Say hello to chat'
				+'</div>',
			settable_map : {}
		},
		stateMap = {$container : null},
		jqueryMap = {},
		setJqueryMap, configModule, initModule
	// Служебные методы
	// Начало методов DOM

	setJqueryMap = function () {
		var $container = stateMap.$container;
		jqueryMap =  {$container : $container};
	}
	// Обработчики событий
	// Открытые методы

		// метод configModule
		// Назначение : настроить допустимые ключи 
		// Аргумениы : хэш настраиваемых кдючей и их методов
		// 		color_name - какой цвет использовать
		// Параметры : 
		// 		configMap.settable_map - обьявляет допустимые кдючи
		// Возвращает : true
		// Исключение : нет

	configModule = function (input_map) {
		spa.util.setConfigMap({
			input_map 	 : input_map,
			settable_map : configMap.settable_map,
			config_map 	 : configMap
		});
		return true;
	};

		// метод initModule
		// Назначение: инициализарует модуль
		// Аргументы: 
		// 		$container - элемент jquery, используемфый этим модулем
		// Возвращает: true
		// Исключения: none
	initModule = function ($container) {
		$container.html(configMap.main_html);
		stateMap.$container = $container;
		setJqueryMap();
		return true;
	}

	// вернуть открытые методы
	return{
		configModule : configModule,
		initModule 	 : initModule
	}
}());