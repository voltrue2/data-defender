'use strict';

var ERROR = require('../../lib/error');

function Data(struct) {
	this._struct = struct;
	this._props = {};
}

Data.prototype.load = function (data) {
	for (var name in data) {
		this.update(name, data[name]);
	}
};

Data.prototype.update = function (name, value) {
	var data = this._struct._update(name, value);
	var hasProp = this._props.hasOwnProperty(name);

	if (data.unique && hasProp && this._props[name] !== value) {
		throw new Error(ERROR.VAL_CHANGE_NOT_ALLOWED);
	}

	this._props[name] = value;
};

Data.prototype.get = function (name) {
	if (this._props.hasOwnProperty(name)) {
		return this._props[name];
	}
	return null;
};

Data.prototype.toJSON = function () {
	return this._struct._toJSON(this._props);
};

module.exports = Data;
