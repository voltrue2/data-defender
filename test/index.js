var assert = require('assert');
var defender = require('data-defender');

describe('data-defender', function () {
	
	var test;
	var dataObj;

	it('can create a data schema object', function () {
		test = defender.create('test');
	});

	it('can define data schema', function () {
		test.define('id', {
			type: defender.DATATYPE.UNIQUE
		});
		test.define('name', {
			type: defender.DATATYPE.STR,
			max: 10,
			min: 2
		});
		test.define('number', {
			type: defender.DATATYPE.NUM,
			max: 100,
			min: 1
		});
		test.define('list', {
			type: defender.DATATYPE.ARR,
			max: 3,
			min: 1
		});
		test.define('map', {
			type: defender.DATATYPE.OBJ,
			max: 2,
			min: 1
		});
		test.define('struct', {
			type: defender.DATATYPE.OBJ
		});
		dataObj = test.load();
	});

	it('can define more data property before locking', function () {
		test.define('extra', {
			type: defender.DATATYPE.STR,
			default: 'A',
			max: 1,
			min: 0
		});
	});

	it('cannot define a property with the same name', function () {
		var error = true;
		try {
			test.define('id', {
				type: defender.DATATYPE.NUM,
				max: 100000,
				min: 100000
			});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot define a property with the default value that is invalid type', function () {
		var error = true;
		try {
			test.define('nogood', {
				type: defender.DATATYPE.NUM,
				max: 100000,
				min: 100000,
				default: '100'
			});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot define a property with the default value that is bigger than max', function () {
		var error = true;
		try {
			test.define('nogood2', {
				type: defender.DATATYPE.NUM,
				max: 100000,
				min: 100000,
				default: 10000000
			});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot define a property with the default value that is smaller than min', function () {
		var error = true;
		try {
			test.define('nogood3', {
				type: defender.DATATYPE.NUM,
				max: 100000,
				min: 100000,
				default: 10
			});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot define a property with max that is smaller than min', function () {
		var error = true;
		try {
			test.define('bad', {
				type: defender.DATATYPE.ARR,
				max: 2,
				min: 3
			});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot define a property with max that is smaller than min (both below 0)', function () {
		var error = true;
		try {
			test.define('bad', {
				type: defender.DATATYPE.ARR,
				max: -3,
				min: -2
			});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot define a property after locking', function () {
		var error = true;
		test.lockSchema();
		try {
			test.define('tooLate', {
				type: defender.OBJ
			});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('can update a property with valid value (string)', function () {
		dataObj.update('name', 'Test 101');
	});

	it('cannot update a property with invalid value (datatype)', function () {
		var error = true;
		try {
			dataObj.update('name', 1000);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (max)', function () {
		var error = true;
		try {
			dataObj.update('name', '01234567890');
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (min)', function () {
		var error = true;
		try {
			dataObj.update('name', '0');
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('can update a property with valid value (number)', function () {
		dataObj.update('number', 99);
	});

	it('cannot update a property with invalid value (datatype)', function () {
		var error = true;
		try {
			dataObj.update('number', []);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (max)', function () {
		var error = true;
		try {
			dataObj.update('number', 10000);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (min)', function () {
		var error = true;
		try {
			dataObj.update('number', 0);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('can update a property with valid value (array)', function () {
		dataObj.update('list', [1,2,3]);
	});

	it('cannot update a property with invalid value (datatype)', function () {
		var error = true;
		try {
			dataObj.update('list', {});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (max)', function () {
		var error = true;
		try {
			dataObj.update('list', [1,2,3,4,5]);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (min)', function () {
		var error = true;
		try {
			dataObj.update('list', []);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('can update a property with valid value (object)', function () {
		dataObj.update('map', { one: 1, two: 2 });
	});

	it('cannot update a property with invalid value (datatype)', function () {
		var error = true;
		try {
			dataObj.update('map', []);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (max)', function () {
		var error = true;
		try {
			dataObj.update('map', { one: 1, two: 2, three: 3 });
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property with invalid value (min)', function () {
		var error = true;
		try {
			dataObj.update('map', {});
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update a property that is UNIQUE', function () {
		var error = true;
		try {
			dataObj.update('id', 1234567890);
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('can set a struct object to a property', function () {
		var data = {
			value: 100
		};
		var simple = defender.create('simple');
		simple.define('value', {
			type: defender.DATATYPE.NUM
		});
	});
	
	it('can load an object and return it as a JSON with .toJSON()', function () {
		var newObj = test.load();
		var data = {
			id: newObj.get('id'),
			name: 'Test Name',
			number: 10,
			list: [1,2,3],
			map: { one: 'one', two: '2' },
			struct: {},
			extra: 'A'
		};
		newObj.load(data);
		var json = newObj.toJSON();
		data.id = newObj.get('id');
		assert.equal(JSON.stringify(json), JSON.stringify(data));
	});

});
