'use strict';

exports.DUP_SCHEMA_CREATE = function (msg) {
	return 'DUPLICATE_DATA_SCHEMA: The schema "' + msg + '" already exists';
};

exports.INVAL_TYPE = function (msg) {
	return 'INVALID_DATA_TYPE: The data type must be follow: ' +
		'0: number, 1: string, 2: array, 3: object, 4: unique -> ' +
		'But "' + msg + '" given';
};

exports.PROP_NOT_DEF = function (msg) {
	return 'PROPERTY_NOT_DEFINED: The property "' + msg + '" must be defined by .define()';
};

exports.INVAL_VAL = function (msg) {
	return 'INVALID_PROPERTY_VALUE: The property value is invalid "' + msg + '"';
};

exports.SCHEMA_NOT_FOUND = function (msg) {
	return 'SCHEMA_NOT_FOUND: The schema "' + msg + '" has not been ceated';
};

exports.VAL_CHANGE_NOT_ALLOWED = function () {
	return 'VALUE_UPDATE_NOT_ALLOWED: The UNIQUE data type cannot be changed';
};

exports.SCHEMA_LOCKED = function () {
	return 'SCHEMA_LOCKED: The schema has already been locked and it cannot be changed';
};

exports.INVAL_DEFAULT = function (msg) {
	return 'INVALID_DEFAULT_VALUE: The default "' + msg + '" value is invalid';
};

exports.INVAL_MAX = function (msg) {
	return 'INVALID_PROPERTY_MAX_VALUE: The defined max value is invalid "' + msg + '"';
};

exports.INVAL_MIN = function (msg) {
	return 'INVALID_PROPERTY_MIN_VALUE: The defined min value is invalid "' + msg + '"';
};

