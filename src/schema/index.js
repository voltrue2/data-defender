'use strict';

var ERROR = require('../../lib/error');
var Struct = require('./struct');

var data = {};

exports.DATATYPE = require('../../lib/datatype');

exports.returnError = function () {
	ERROR.returnError();
};

exports.create = function (name) {
	if (data.hasOwnProperty(name)) {
		return ERROR.DUP_SCHEMA_CREATE(this, name);
	}
	var struct = new Struct(name); 
	data[name] = struct;
	return struct;
};

exports.get = function (name) {
	if (!data.hasOwnProperty(name)) {
		return ERROR.SCHEMA_NOT_FOUND(this, name);
	}
	return data[name];
};
