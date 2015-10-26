'use strict';

var ERROR = require('../../lib/error');
var Struct = require('./struct');

var data = {};

exports.DATATYPE = require('../../lib/datatype');

exports.create = function (name) {
	if (data.hasOwnProperty(name)) {
		throw new Error(ERROR.DUP_SCHEMA_CREATE(name));
	}
	var struct = new Struct(name); 
	data[name] = struct;
	return struct;
};

exports.get = function (name) {
	if (!data.hasOwnProperty(name)) {
		throw new Error(ERROR.SCHEMA_NOT_FOUND(name));
	}
	return data[name];
};
