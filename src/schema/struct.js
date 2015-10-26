'use strict';

var uuid = require('node-uuid');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var ERROR = require('../../lib/error');
var DATATYPE = require('../../lib/datatype');
var Data = require('./data');

function Struct() {
	EventEmitter.call(this);
	this._constraints = {};
	this._uniqueList = [];
	this._lock = false;
}

util.inherits(Struct, EventEmitter);

/*
valMap = {
	type: <enum> // DATATYPE...
	*default: <default value>,
	*max: <number>
	*min: <number>
};
*/
Struct.prototype.define = function (name, valMap) {
	if (this._lock) {
		throw new Error(ERROR.SCHEMA_LOCKED());
	}
	if (this._constraints.hasOwnProperty(name)) {
		throw new Error(ERROR.DUP_STRUCT_PROP(name));
	}
	if (!DATATYPE.isValidType(valMap.type)) {
		throw new Error(ERROR.INVAL_TYPE(valMap.type));
	}
	if (valMap.default !== undefined && !isValid(valMap, valMap.default)) {
		throw new Error(ERROR.INVAL_DEFAULT(valMap.default));
	}
	if (valMap.max && typeof valMap.max !== 'number') {
		throw new Error(ERROR.INVAL_MAX(valMap.max));
	}
	if (valMap.min && typeof valMap.min !== 'number') {
		throw new Error(ERROR.INVAL_MIN(valMap.min));
	}
	if (valMap.max && typeof valMap.max === 'number' && typeof valMap.min === 'number' && valMap.max < valMap.min) {
		throw new Error(ERROR.INVAL_MAX(valMap.max));
	}
	this._constraints[name] = {
		type: valMap.type,
		default: valMap.default || null,
		max: valMap.max || null,
		min: valMap.min || null
	};
	if (valMap.type === DATATYPE.UNIQUE) {
		this._uniqueList.push(name);
	}
};

Struct.prototype.lockSchema = function () {
	this._lock = true;
};

Struct.prototype.load = function (values) {
	var data = new Data(this);
	
	if (!values) {
		// initial load w/o data
		values = {};
		for (var i = 0, len = this._uniqueList.length; i < len; i++) {
			values[this._uniqueList[i]] = uuid.v4();
		}
	}

	data.load(values);
	return data;
};

Struct.prototype._update = function (name, value) {
	if (!this._constraints.hasOwnProperty(name)) {
		throw new Error(ERROR.PROP_NOT_DEF(name));
	}
	if (!isValid(this._constraints[name], value)) {
		throw new Error(ERROR.INVAL_VAL(value));
	}
	if (this._constraints[name].type === DATATYPE.UNIQUE) {
		return { name: name, value: value, unique: true };
	}
	return { name: name, value: value };
};

Struct.prototype._toJSON = function (props) {
	var parser = function (obj) {
		var tmp = (Array.isArray(obj)) ? [] : {};
		for (var i in obj) {
			if (typeof obj[i] === 'object') {
				if (obj[i] instanceof Struct) {
					return obj[i].toJSON();
				}
				tmp[i] = parser(obj[i]);
				continue;
			}
			tmp[i] = obj[i];
		}
		return tmp;
	};
	return parser(props);
};

module.exports = Struct;

function isValid(constraints, value) {
	var len;

	// if null is not allowd
	if (constraints.default !== null && value === null) {
		return false;
	}
	
	// data type validation
	switch (constraints.type) {
		case DATATYPE.NUM:
			if (typeof value !== 'number') {
				return false;
			}
			len = value;
			break;
		case DATATYPE.STR:
			if (typeof value !== 'string') {
				return false;
			}
			len = value.length;
			break;
		case DATATYPE.ARR:
			if (typeof value !== 'object') {
				return false;
			}
			if (!Array.isArray(value)) {
				return false;
			}
			len = value.length;
			break;
		case DATATYPE.OBJ:
			if (typeof value !== 'object') {
				return false;
			}
			if (Array.isArray(value)) {
				return false;
			}
			len = Object.keys(value).length;
			break;
		case DATATYPE.UNIQUE:
			return true;
		default:
			throw new Error(ERROR.INVAL_TYPE(constraints.type));
	}
	
	// validation of maximum and minimum value allowed
	if (constraints.hasOwnProperty('max') && constraints.max !== null && len > constraints.max) {
		return false;
	}
	if (constraints.hasOwnProperty('min') && constraints.min !== null && len < constraints.min) {
		return false;
	}
	
	return true;
}
