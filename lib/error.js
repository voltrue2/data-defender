'use strict';

var willThrow = true;

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
	INVAL_MIN: 'INVALID_MIN_CONSTRAINT',
	INVAL_SCHEMA: 'INVALID_SCHEMA_GIVEN',
	INVAL_VALIDATION: 'INVALID_PROPERY_VALIDATION_FUNC',
	NO_VAL: 'MISSING_VALUE'
};

exports.returnError = function () {
	willThrow = false;
};

exports.NO_VAL = function (struct, msg) {
	var m = exports.CODE.NO_VAL + ': Property "' + msg + '" is missing its value and there is no default value';
	var error = new Error(m);
	error.code = exports.CODE.NO_VAL;
	return handleError(struct, error);
};

exports.INVAL_VALIDATION = function (struct, msg) {
	var m = exports.CODE.INVAL_VALIDATION + ': The validation function "' + msg + '" is invalid';
	var error = new Error(m);
	error.code = exports.CODE.INVAL_VALIDATION;
	return handleError(struct, error);
};

exports.DUP_SCHEMA_CREATE = function (struct, msg) {
	var m = exports.CODE.DUP_SCHEMA + ': The schema "' + msg + '" already exists';
	var error = new Error(m);
	error.code = exports.CODE.DUP_SCHEMA;
	return handleError(struct, error);
};

exports.INVAL_TYPE = function (struct, msg) {
	var m = exports.CODE.INVAL_TYPE + ': The data type must follow: ' +
		'0: number, 1: string, 2: array, 3: object, 4: unique, 5: date, 6: boolean -> ' +
		'But "' + msg + '" given';
	var error = new Error(m);
	error.code = exports.CODE.INVAL_TYPE;
	return handleError(struct, error);
};

exports.PROP_NOT_DEF = function (struct, msg) {
	var m = exports.CODE.PROP_NOT_DEF + ': The property "' + msg + '" must be defined by .define()';
	var error = new Error(m);
	error.code = exports.CODE.PROP_NOT_DEF;
	return handleError(struct, error);
};

exports.INVAL_VAL = function (struct, msg) {
	var m = exports.CODE.INVAL_PROP_VAL + ': The property value is invalid "' + msg + '"';
	var error = new Error(m);
	error.code = exports.CODE.INVAL_PROP_VAL;
	return handleError(struct, error);
};

exports.SCHEMA_NOT_FOUND = function (struct, msg) {
	var m = exports.CODE.SCHEMA_NOT_FOUND + ': The schema "' + msg + '" has not been ceated';
	var error = new Error(m);
	error.code = exports.CODE.SCHEMA_NOT_FOUND;
	return handleError(struct, error);
};

exports.VAL_CHANGE_NOT_ALLOWED = function (struct) {
	var m = exports.CODE.VAL_CHANGE_NOT_ALLOWED + ': The UNIQUE data type cannot be changed';
	var error = new Error(m);
	error.code = exports.CODE.VAL_CHANGE_NOT_ALLOWED;
	return handleError(struct, error);
};

exports.SCHEMA_LOCKED = function (struct) {
	var m = exports.CODE.SCHEMA_LOCKED + ': The schema has already been locked and it cannot be changed';
	var error = new Error(m);
	error.code = exports.CODE.SCHEMA_LOCKED;
	return handleError(struct, error);
};

exports.INVAL_DEFAULT = function (struct, name, msg) {
	var m = exports.CODE.INVAL_DEF + ': Property ' + name + '\'s default "' + msg + '" is invalid';
	var error = new Error(m);
	error.code = exports.CODE.INVAL_DEF;
	return handleError(struct, error);
};

exports.INVAL_MAX = function (struct, msg) {
	var m = exports.CODE.INVAL_MAX + ': The defined max value is invalid "' + msg + '"';
	var error = new Error(m);
	error.code = exports.CODE.INVAL_MAX;
	return handleError(struct, error);
};

exports.INVAL_MIN = function (struct, msg) {
	var m = exports.CODE.INVAL_MIN + ': The defined min value is invalid "' + msg + '"';
	var error = new Error(m);
	error.code = exports.CODE.INVAL_MIN;
	return handleError(struct, error);
};

exports.INVAL_SCHEMA = function (struct, msg) {
	var m = exports.CODE.INVAL_SCHEMA + ': The schema must be an instance of Struct (data-defender.create()) "' + msg + '"';
	var error = new Error(m);
	error.code = exports.CODE.INVAL_SCHEMA;
	return handleError(struct, error);
};

function handleError(struct, error) {

	if (willThrow) {
		throw error;
	}

	// dispatch event
	//struct.emit('error', error);
	//struct.emit(error.code, error);

	// return error
	return error;
}

