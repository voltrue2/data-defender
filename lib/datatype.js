'use strict';

var list = [
	'NUM',
	'STR',
	'ARR',
	'OBJ',
	'UNIQUE',
	'DATE',
	'BOOL'
];

exports.NUM = 0;
exports.STR = 1;
exports.ARR = 2;
exports.OBJ = 3;
exports.UNIQUE = 4;
exports.DATE = 5;
exports.BOOL = 6;

exports.isValidType = function (type) {
	if (!list[type]) {
		return false;
	}
	return true;
};
