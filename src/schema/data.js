'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var ERROR = require('../../lib/error');

function Data(struct) {
	EventEmitter.call(this);
	this._struct = struct;
	this._props = {};
}

util.inherits(Data, EventEmitter);

Data.prototype.load = function (data) {
	if (data) {
		for (var name in data) {
			var err = this._update(name, data[name]);
			if (err instanceof Error) {
				return err;
			}
		}
		this.emit('load', data);
	}
};

Data.prototype.update = function (name, value) {
	var err = this._update(name, value);
	if (err instanceof Error) {
		return err;
	}
	var list = this._struct._getModtimeList();
	for (var i = 0, len = list.length; i < len; i++) {
		this._props[list[i]] = Date.now();
	}
	this.emit('update', name, value);
	this.emit('update.' + name, value);
};

Data.prototype._update = function (name, value) {
	var data = this._struct._update(name, value);
	if (data instanceof Error) {
		return data;
	}
	var hasProp = this._props.hasOwnProperty(name);

	if (data.noChange && hasProp && this._props[name] !== value) {
		return ERROR.VAL_CHANGE_NOT_ALLOWED(this, name);
	}

	// auto-convert
	if (value instanceof Date) {
		value = value.getTime();
	}

	this._props[name] = value;
};

Data.prototype.get = function (name) {
	if (this._props.hasOwnProperty(name)) {
		return this._struct._typecast(name, this._props[name]);
	}
	return null;
};

Data.prototype.toJSON = function () {
	return this._struct._toJSON(this._props);
};

module.exports = Data;
