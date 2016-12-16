spa.util_b = (function () {
	'use strict';
	// Переменные области видимости
	var configMap = {
		regex_encode_html  : /[&"'><]/g,
		regex_encode_noamp : /["'><]/g,
		html_encode_map	   : {
			'&' : '&#38;',
			'"' : '&#34;',
			"'" : '&#39;',
			'>' : '&#62;',
			'<' : '&#60'
		}
	},

	decodeHtml, encodeHtml, getEmSize;

	configMap.encode_noamp_map = $.extend(
		{}, configMap.html_encode_map
	);
	delete configMap.encode_noamp_map['&'];


	// Открытые методы

	// decodeHtml
	// Декодирует HTML-компоненты в среде браузера
	decodeHtml = function (str) {
		return $('<div/>').html(str || '').text();
	};

	// encodeHtml
	// Однопроходный кодировщик HTML-компонентов, способный
	// обработать произвольное число символов
	encodeHtml = function (input_arg_str, exclude_amp) {
		var 
			input_str = String(input_arg_str),
			regex, lookup_map;

		if (exclude_amp) {
			lookup_map = configMap.encode_noamp_map;
			regex = configMap.regex_encode_noamp;
		} else{
			lookup_map = configMap.html_encode_map;
			regex = configMap.regex_encode_html;
		}
		return input_str.replace(regex, function (match, name) {
			return lookup_map[match] || '';
		});
	};

	// getEmSize
	// Возвращает размер em в пикселях
	getEmSize = function (elem) {
		return Number(
			getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
		);
	};

	return {
		decodeHtml : decodeHtml,
		encodeHtml : encodeHtml,
		getEmSize  : getEmSize
	};
}());