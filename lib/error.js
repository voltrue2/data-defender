'use strict';

exports.CODE = {
	SCHEMA_LOCKED: 'SCHEMA_LOCKED',
	DUP_SCHEMA: 'DUPLICATE_SCHEMA',
	INVAL_TYPE: 'INVALID_DATA_TYPE',
	PROP_NOT_DEF: 'PROPERTY_NOT_DEFINED',
	INVAL_PROP_VAL: 'INVALID_PROPERTY_VALUE',
	SCHEMA_NOT_FOUND: 'SCHEMA_NOT_FOUND',
	VAL_CHANGE_NOT_ALLOWED: 'VALUE_UPDATE_NOT_ALLOWED',
	INVAL_DEF: 'INVALID_DEFAULT_VALUE',
	INVAL_MAX: 'INVALID_MAX_CONSTRAINT',
	INVAL_MIN: 'INVALID_MIN_CONSTRAINT'
};

exports.DUP_SCHEMA_CREATE = function (msg) {
	return exports.CODE.DUP_SCHEMA + ': The schema "' + msg + '" already exists';
};

exports.INVAL_TYPE = function (msg) {
	return exports.CODE.INVAL_TYPE + ': The data type must follow: ' +
		'0: number, 1: string, 2: array, 3: object, 4: unique, 5: date, 6: boolean -> ' +
		'But "' + msg + '" given';
};

exports.PROP_NOT_DEF = function (msg) {
	return exports.CODE.PROP_NOT_DEF + ': The property "' + msg + '" must be defined by .define()';
};

exports.INVAL_VAL = function (msg) {
	return exports.CODE.INVAL_PROP_VAL + ': The property value is invalid "' + msg + '"';
};

exports.SCHEMA_NOT_FOUND = function (msg) {
	return exports.CODE.SCHEMA_NOT_FOUND + ': The schema "' + msg + '" has not been ceated';
};

exports.VAL_CHANGE_NOT_ALLOWED = function () {
	return exports.CODE.VAL_CHANGE_NOT_ALLOWED + ': The UNIQUE data type cannot be changed';
};

exports.SCHEMA_LOCKED = function () {
	return exports.CODE.SCHEMA_LOCKED + ': The schema has already been locked and it cannot be changed';
};

exports.INVAL_DEFAULT = function (msg) {
	return exports.CODE.INVAL_DEF + ': The default "' + msg + '" value is invalid';
};

exports.INVAL_MAX = function (msg) {
	return exports.CODE.INVAL_MAX + ': The defined max value is invalid "' + msg + '"';
};

exports.INVAL_MIN = function (msg) {
	return exports.CODE.INVAL_MIN + ': The defined min value is invalid "' + msg + '"';
};

