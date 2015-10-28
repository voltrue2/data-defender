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
	this._modtimeList = [];
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
	// schema state check
	if (this._lock) {
		throw new Error(ERROR.SCHEMA_LOCKED());
	}
	// schema constraints check
	if (this._constraints.hasOwnProperty(name)) {
		throw new Error(ERROR.DUP_STRUCT_PROP(name));
	}
	if (!DATATYPE.isValidType(valMap.type)) {
		throw new Error(ERROR.INVAL_TYPE(valMap.type));
	}
	if (valMap.max && typeof valMap.max !== 'number') {
		if (valMap.max instanceof Date) {
			valMap.max = valMap.max.getTime();
		} else {
			throw new Error(ERROR.INVAL_MAX(valMap.max));
		}
	}
	if (valMap.min && typeof valMap.min !== 'number') {
		if (valMap.min instanceof Date) {
			valMap.min = valMap.min.getTime();
		} else {
			throw new Error(ERROR.INVAL_MIN(valMap.min));
		}
	}
	var maxIsNum = typeof valMap.max === 'number';
	var minIsNum = typeof valMap.min === 'number';
	if (valMap.max && maxIsNum && minIsNum && valMap.max < valMap.min) {
		throw new Error(ERROR.INVAL_MAX(valMap.max));
	}
	if (valMap.max && valMap.type === DATATYPE.DATE) {
		if (maxIsNum) {
			// assume it is unix timestamp in milliseconds
			valMap.max = new Date(valMap.max).getTime();
		} else if (valMap.max instanceof Date) {
			valMap.max = valMap.max.getTime();
		}
	}
	if (valMap.min && valMap.type === DATATYPE.DATE) {
		if (minIsNum) {
			// assume it is unix timestamp in milliseconds 
			valMap.min = new Date(valMap.min).getTime();
		} else if (valMap.min instanceof Date) {
			valMap.min = valMap.min.getTime();
		}
	}
	// default value check
	if (valMap.default !== undefined && !isValid(valMap, valMap.default)) {
		throw new Error(ERROR.INVAL_DEFAULT(valMap.default));
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
	if (valMap.type === DATATYPE.MOD) {
		this._modtimeList.push(name);
	}
};

Struct.prototype.lockSchema = function () {
	this._lock = true;
};

Struct.prototype.load = function (values) {
	var data = new Data(this);
	
	if (!values) {
		values = {};
		// set default values if provided and handle unique values
		for (var name in this._constraints) {
			var item = this._constraints[name];
			if (item.type !== DATATYPE.UNIQUE) {
				if (typeof item.default === 'function') {
					values[name] = item.default();
					continue;
				}
				if (item.default !== null) {
					values[name] = item.default;
				}
			} else {
				// unique type property
				values[name] = uuid.v4();
			}
		}
	}

	data.load(values);
	return data;
};

Struct.prototype._typecast = function (name, value) {
	if (!this._constraints.hasOwnProperty(name)) {
		throw new Error(ERROR.PROP_NOT_DEF(name));
	}
	var constraint = this._constraints[name];
	if (constraint.type === DATATYPE.DATE || constraint.type === DATATYPE.MOD) {
		return new Date(value);
	}
	return value;
};

Struct.prototype._update = function (name, value) {
	if (!this._constraints.hasOwnProperty(name)) {
		throw new Error(ERROR.PROP_NOT_DEF(name));
	}
	if (!isValid(this._constraints[name], value)) {
		throw new Error(ERROR.INVAL_VAL(value));
	}
	if (this._constraints[name].type === DATATYPE.UNIQUE) {
		return { name: name, value: value, noChange: true };
	}
	if (this._constraints[name].type === DATATYPE.MOD) {
		return { name: name, value: value, noChange: true };
	}
	if (this._constraints[name].type === DATATYPE.DATE && value instanceof Date) {
		value = value.getTime();
	}
	return { name: name, value: value };
};

Struct.prototype._getModtimeList = function () {
	return this._modtimeList;
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
		case DATATYPE.DATE:
		case DATATYPE.MOD:
			if (!value instanceof Date) {
				return false;
			}
			if (typeof value !== 'function') {
				if (value.getTime) {
					len = value.getTime();
				} else {
					len = value;
				}
			} else {
				len = value();
			}
			break;
		case DATATYPE.BOOL:
			if (value !== true && value !== false) {
				return false;
			}
			break;
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
