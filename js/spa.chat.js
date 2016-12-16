spa.chat = (function () {
	// Переменные области видимости модуля
	var 
		configMap = {
			main_html : String()
				+'<div class="spa-chat">'
				+	'<div class="spa-chat-head">'
				+		'<div class="spa-chat-head-toggle">-</div>'
				+		'<div class="spa-chat-head-title">'
				+			'Chat'
				+		'</div>'
				+	'</div>'
				+	'<div class="spa-chat-closer">x</div>'
				+	'<div class="spa-chat-sizer">'
				+		'<div class="spa-chat-msgs"></div>'
				+		'<div class="spa-chat-box">'
				+			'<input type="text"/>'
				+			'<div>send</div>'
				+		'</div>'
				+	'</div>'
				+'</div>',
			settable_map : {
				slider_open_time  :true,
				slider_close_time :true,
				slider_open_em    :true,
				slider_close_em   :true,
				slider_open_title :true,
				slider_close_title:true,

				chat_model     :true,
				people_model   :true,
				set_chat_anchor:true
			},

			slider_open_time     :250,
			slider_close_time    :250,
			slider_open_em       :18,
			slider_close_em      :2,
			slider_opened_min_em : 10,
			window_height_min_em : 20,
			slider_open_title    :'Click to close',
			slider_close_title   :'Click to open',

			chat_model     :null,
			people_model   :null,
			set_chat_anchor:null
		},
		stateMap = {
			$append_target   :null,
			position_type    :'closed',
			px_per_em        :0,
			slider_hidden_px :0,
			slider_closed_px :0,
			slider_opened_px :0
		},
		jqueryMap = {},
		setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
		 onClickToggle, configModule, initModule,
		 removeSlider, handleResize;

	// Служебные методы
	getEmSize = function (elem) {
		return Number(
			getComputedStyle(elem,'').fontSize.match(/\d*\.?\d*/)[0]
		);
	}

	// Начало методов DOM
		// Метод setJqueryMap
	setJqueryMap = function () {
		var 
			$append_target = stateMap.$append_target,
			$slider = $append_target.find('.spa-chat');

		jqueryMap =  {
			$slider : $slider,
			$head   : $slider.find('.spa-chat-head'),
			$toggle : $slider.find('.spa-chat-head-toggle'),
			$title  : $slider.find('.spa-chat-head-title'),
			$sizer  : $slider.find('.spa-chat-sizer'),
			$msgs   : $slider.find('.spa-chat-msgs'),
			$box    : $slider.find('.spa-chat-box'),
			$input  : $slider.find('.spa-chat-input input[type=text]')
		};
	};
		// Метод setPxSizes
	setPxSizes = function () {
		var px_per_em, window_height_em, opened_height_em;

		px_per_em = getEmSize( jqueryMap.$slider.get(0));
		window_height_em = Math.floor(
			($(window).height() / px_per_em) + 0.5
		);

		opened_height_em = 
			window_height_em > configMap.window_height_min_em
			? configMap.slider_open_em
			: configMap.slider_opened_min_em;

		stateMap.px_per_em = px_per_em;
		stateMap.slider_opened_px = opened_height_em * px_per_em;
		stateMap.slider_closed_px = configMap.slider_close_em * px_per_em;
		jqueryMap.$sizer.css({
			height : (opened_height_em - 2) * px_per_em
		});
	};

		// Метод handleResize
		// Назначение : 
		// 		В ответ на событие изменения размера окна корркетирует
		//		представление, формеруемое данным модулем, если необходимо
		// Действия :
		// 		Если высота или ширина окна оказывается меньше заданного порога,
		//		изменить размер выплывающего чата в соответствии с уменьшимся размером окна.
		// Возвращает :
		//		false - изменение размера не учтено
		//		true - изменение размера учтено
		// Исключения : нет
	handleResize = function () {
		// ничего не делать, если выплывающего контейнера нет
		if (! jqueryMap.$slider) { return false}

		setPxSizes();
		if (stateMap.position_type === 'opened') {
			jqueryMap.$slider.css({ height : stateMap.slider_opened_px });
		}
		return true;
	};
	// Обработчики событий

	onClickToggle = function (event) {
		var set_chat_anchor = configMap.set_chat_anchor;
		if (stateMap.position_type === 'opened') {
			set_chat_anchor('closed');
		} else 
			if (stateMap.position_type === 'closed') {
				set_chat_anchor('opened');
			} return false;
	};
	// Открытые методы
		// метод setSliderPosition
		// Пример : spa.chat.setSliderPosition('closed');
		// Назначение : установить окно чата в требуемое состояние
		// Аргументы : 
		//		position_type - enum('closed', 'opened', 'hidden')
		//		callback - необязательная функция, вызывается при завершении анимации
		// Действие : 
		// 		Оставляет окно чата в текущем состоянии, если новое состояние
		// 		совпадает с текущим, иначе анимирует переход в новое состоянеи.
		// Возвращает : 
		// 		true - запрошенное состояние установлено
		//		false - запрошенное состояние не установленно
		// Исключения : нет
	setSliderPosition = function (position_type, callback) {
		var 
			height_px, animate_time, slider_title, toggle_text;

			// вернуть true, если окно чата уже находится в требуемом состоянии
			if (stateMap.position_type === position_type) {
				return true;
			};

			// подготовить пареметры анимации
			switch(position_type){
				case 'opened' : 
					height_px = stateMap.slider_opened_px;
					animate_time = configMap.slider_open_time;
					slider_title = configMap.slider_open_title;
					toggle_text = '=';
				break;

				case 'hidden' :
					height_px = 0;
					animate_time = configMap.slider_open_time;
					slider_title = '';
					toggle_text = '+';
				break;

				case 'closed' :
					height_px = stateMap.slider_closed_px;
					animate_time = configMap.slider_close_time;
					slider_title = configMap.slider_close_title;
					toggle_text = '+';
				break;

				// выйдти из метода, если position_type имеет неизвестное значение
				default : return false;
			}

			// анимировать изменение состояния окна чата
			stateMap.position_type = '';
			jqueryMap.$slider.animate(
				{ height : height_px },
				animate_time,
				function () {
					jqueryMap.$toggle.prop('title', slider_title);
					jqueryMap.$toggle.text(toggle_text);
					stateMap.position_type = position_type;
					if (callback) { callback(jqueryMap.$slider);}
				}
			);
			return true;
	};

		// метод configModule
		// Пример : spa.chat.configModule({slider_open_em : 18});
		// Назначение : сконфигурировать модуль до инициализации
		// Аргумениы : 
		// 	  *	set_chat_anchor - обратный вызов для модификации якоря в URI,
		//		чтобы отразить состояние: открыт или закрыт. Обратный вызов должен
		//		возвращать false, если установить указанное состояние невозможно.
		//	  *	chat_model - объект модели chat, котоый предоставляет методы для
		//		взаимодействия с нашей системой мгновенного обмена сообщениями.
		//	  *	people_model - объект модели people, который предоставляет
		//      методы для управления списком пользователей, хранящимся в модели.
		//	  * параметры slider_*. Все это необязательные скляры.
		// Действие : 
		// 		Внутренняя структура, в которой хранятся конфигурационные параметры
		//      (configMap), обновляется в соответствии с переданными аргументами.
		//		Больше никаких действий не предпринимается.
		// Возвращает : true
		// Исключение : объект ошибки

	configModule = function (input_map) {
		spa.util.setConfigMap({
			input_map 	 : input_map,
			settable_map : configMap.settable_map,
			config_map 	 : configMap
		});
		return true;
	};

		// метод initModule
		// Пример : spa.chat.initModule($('#div_id'));
		// Назначение: 
		//      Требует, чтобы Chat начал предоставлять свою функциональность
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
	initModule = function ($append_target) {
		$append_target.append(configMap.main_html);
		stateMap.$append_target = $append_target;
		setJqueryMap();
		setPxSizes();

		// Установить начальный заголовок окна чата
		jqueryMap.$toggle.prop('title', configMap.slider_close_title);
		jqueryMap.$head.click(onClickToggle);
		stateMap.position_type = 'closed';
		return true;
	}

		// Метод removeSlider
		// Назначение : 
		//		удаляет из DOM элемент chatSlider
		//		возвращает исходное состояние
		//  	удаляет указатели на методы обратного вызова и другие данные
		// Аргументы : нет
		// Возвращает : true
		// Исключения : нет
	removeSlider = function () {
		// откатить инициализацию и стереть состояние
		// удалить из DOM контейнер; при этом удаляется и привязки событий
		if (jqueryMap.$slider) {
			jqueryMap.$slider.remove();
			jqueryMap = {};
		}
		stateMap.$append_target = null;
		stateMap.position_type = 'closed';

		// стереть значения ключей
		configMap.chat_model = null;
		configMap.people_model = null;
		configMap.set_chat_anchor = null;

		return true;
	};
	// вернуть открытые методы
	return {
				setSliderPosition : setSliderPosition,
				configModule      : configModule,
				initModule 	      : initModule,
				removeSlider      : removeSlider,
				handleResize        : handleResize
			};
}());