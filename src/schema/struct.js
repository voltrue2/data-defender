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
	*max: <number>,
	*min: <number>,
	*validation: <function>
};
*/
Struct.prototype.define = function (name, valMap) {
	// schema state check
	if (this._lock) {
		return ERROR.SCHEMA_LOCKED(this);
	}
	// schema constraints check
	if (this._constraints.hasOwnProperty(name)) {
		return ERROR.DUP_STRUCT_PROP(this, name);
	}
	if (!DATATYPE.isValidType(valMap.type)) {
		return ERROR.INVAL_TYPE(this, valMap.type);
	}
	if (valMap.max && typeof valMap.max !== 'number') {
		if (valMap.max instanceof Date) {
			valMap.max = valMap.max.getTime();
		} else {
			return ERROR.INVAL_MAX(this, valMap.max);
		}
	}
	if (valMap.min && typeof valMap.min !== 'number') {
		if (valMap.min instanceof Date) {
			valMap.min = valMap.min.getTime();
		} else {
			return ERROR.INVAL_MIN(this, valMap.min);
		}
	}
	var maxIsNum = typeof valMap.max === 'number';
	var minIsNum = typeof valMap.min === 'number';
	if (valMap.max && maxIsNum && minIsNum && valMap.max < valMap.min) {
		return ERROR.INVAL_MAX(this, valMap.max);
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
		return ERROR.INVAL_DEFAULT(this, name, valMap.default);
	}
	// validate schema if given
	if (valMap.hasOwnProperty('schema') && !valMap.schema instanceof Struct) {
		return ERROR.INVAL_SCHEMA(this, name);
	}
	// validation validation function
	if (valMap.hasOwnProperty('validation') && typeof valMap.validation !== 'function') {
		return ERROR.INVAL_VALIDATION(this, name);
	}
	this._constraints[name] = {
		type: valMap.type,
		default: valMap.default,
		schema: valMap.schema || null,
		validation: valMap.validation || null,
		max: valMap.max,
		min: valMap.min
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

Struct.prototype.getPropertyNames = function () {
	return Object.keys(this._constraints);
};

Struct.prototype.load = function (values) {
	var data = new Data(this);
	
	if (!values) {
		values = {};
	}

	// set default values if provided and handle unique values
	for (var name in this._constraints) {
		if (values.hasOwnProperty(name)) {
			continue;
		}
		var item = this._constraints[name];
		if (item.type !== DATATYPE.UNIQUE) {
			if (item.default === undefined) {
				return ERROR.NO_VAL(this, name);
			}
			if (typeof item.default === 'function') {
				values[name] = item.default();
				continue;
			}
			values[name] = item.default;
		} else {
			// unique type property
			values[name] = uuid.v4();
		}
	}

	var err = data.load(values);
	if (err instanceof Error) {
		return err;
	}
	return data;
};

Struct.prototype._typecast = function (name, value) {
	if (!this._constraints.hasOwnProperty(name)) {
		return ERROR.PROP_NOT_DEF(this, name);
	}
	var constraint = this._constraints[name];
	if (constraint.type === DATATYPE.DATE || constraint.type === DATATYPE.MOD) {
		return new Date(value);
	}
	return value;
};

Struct.prototype._update = function (name, value) {
	if (!this._constraints.hasOwnProperty(name)) {
		return ERROR.PROP_NOT_DEF(this, name);
	}
	if (!isValid(this._constraints[name], value)) {
		return ERROR.INVAL_VAL(this, value);
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
			if (obj[i] === null) {
				tmp[i] = null;
				continue;
			}
			if (typeof obj[i] === 'object') {
				if (obj[i] instanceof Struct) {
					return obj[i]._toJSON();
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

	// null is allowed
	if (value === null) {
		// null is allowed
		if (constraints.default === null) {
			return true;
		}
		// null is not allowed
		if (constraints.default !== null) {
			return false;
		}
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
			//return ERROR.INVAL_TYPE(this, constraints.type);
			return false;
	}

	// validation of maximum and minimum value allowed
	if (constraints.hasOwnProperty('max') && constraints.max !== null && len > constraints.max) {
		return false;
	}
	if (constraints.hasOwnProperty('min') && constraints.min !== null && len < constraints.min) {
		return false;
	}

	if (constraints.hasOwnProperty('validation') && constraints.validation !== null && !constraints.validation(value)) {
		return false;
	}
	
	return true;
}
