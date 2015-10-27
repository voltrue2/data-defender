var assert = require('assert');
var defender = require('data-defender');

describe('data-defender', function () {
	
	var test;
	var dataObj;

	it('can create a data schema object', function () {
		defender.create('test');
	});

	it('can .get() a data schema that has already been created', function () {
		test = defender.get('test');
	});
	
	it('cannot .get() a data schema that does not exist', function () {
		var error = true;
		try {
			var test2 = defender.get('test2');
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});
	
	it('cannot create a schema that already exists', function () {
		var error = true;
		try {
			var test2 = defender.create('test');
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
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

	it('can load data on creation and return it as a JSON with the same values', function () {
		var data = {
			id: '123456789',
			name: 'More Test',
			number: 7,
			list: [4, 5],
			map: { three: 3 },
		};
		var moreTest = test.load(data);
		var json = moreTest.toJSON();
		assert.equal(JSON.stringify(json), JSON.stringify(data));
	});

	it('can listen for "load" on data object', function (done) {
		var data = {
			id: null,
			name: 'More Test',
			number: 7,
			list: [4, 5],
			map: { three: 3 },
		};
		var moreTest = test.load();
		moreTest.on('load', function (values) {
			assert.equal(JSON.stringify(values), JSON.stringify(data));
			done();
		});
		data.id = moreTest.get('id');
		moreTest.load(data);
	});

	it('can listen for update event on a property', function (done) {
		var data = {
			id: '123456789',
			name: 'More Test',
			number: 7,
			list: [4, 5],
			map: { three: 3 },
		};
		var newName = 'new Name';
		var moreTest = test.load(data);
		var json = moreTest.toJSON();
		assert.equal(JSON.stringify(json), JSON.stringify(data));
		moreTest.on('update.name', function (value) {
			assert.equal(value, newName);
			done();
		});
		moreTest.update('name', newName);
	});

	it('can listen for all update events on all properties', function (done) {
		var data = {
			id: '123456789',
			name: 'More Test',
			number: 7,
			list: [4, 5],
			map: { three: 3 },
		};
		var map = {
			name: 'Name 1',
			number: 5,
			list: [3],
			map: { four: '4' }
		};
		var count = 0;
		var max = 4;
		var moreTest = test.load(data);
		var json = moreTest.toJSON();
		assert.equal(JSON.stringify(json), JSON.stringify(data));
		moreTest.on('update', function (name, value) {
			assert.equal(JSON.stringify(value), JSON.stringify(map[name]));
			count += 1;
			if (count === max) {
				done();
			}
		});
		for (var i in map) {
			moreTest.update(i, map[i]);
		}
	});

});
