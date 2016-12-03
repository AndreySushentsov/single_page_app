spa.util = (function () {
	var makeError, setConfigMap;

	// Открытый конструктор makeError
	// Назначение : обертка для создания обьекта ошибки
	// Аргументы : 
	//		name_text - текст ошибки
	//		msg_text - длинное сообщение об ошибке
	// 		data - необязательные данные, сопровождаюшие обьект ошибки
	// Возврашает : вновь сконструированный обьект
	// Исключения : нет
	makeError = function (name_text, msg_text, data) {
		var error = new Error();
		error.name = name_text;
		error.message = msg_text;

		if (data) { error.data = data};

		return error;
	};

	// Окрытый метод setConfigMap
	// Назначение : установка конфигурационных параметров в функциональных модулях
	// Аргументы : 
	//		input_map - хэш ключей и значений, установленный в config
	//		settable_map - хэш доступных ключей
	//		config_map - хэш к которому преминяются новые параметры
	// Возвращает : true
	// Исключения : если входной ключ недопустим
	setConfigMap = function (arg_map) {
		var
			input_map = arg_map.input_map,
			settable_map = arg_map.settable_map,
			config_map = arg_map.config_map,
			key_name, error;

		for (key_name in input_map) {
			if(input_map.hasOwnProperty(key_name)){
				if (settable_map.hasOwnProperty(key_name)) {
					config_map[key_name] = input_map[key_name];
				};
			} 
			else {
				error = makeError('Bad Input', 'Setting config key |' + key_name + '| is not supported');
				throw error;
			}
		};
	};

	return {
		makeError : makeError,
		setConfigMap : setConfigMap
	};
}());