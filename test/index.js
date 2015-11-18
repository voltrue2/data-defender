var assert = require('assert');
var defender = require('data-defender');

describe('data-defender', function () {
	
	var test;
	var dataObj;
	var dateObj;

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
			min: 2,
			default: null
		});
		test.define('number', {
			type: defender.DATATYPE.NUM,
			max: 100,
			min: 1,
			default: null
		});
		test.define('list', {
			type: defender.DATATYPE.ARR,
			default: null,
			max: 3,
			min: 1
		});
		test.define('map', {
			type: defender.DATATYPE.OBJ,
			default: null,
			max: 2,
			min: 1
		});
		test.define('struct', {
			type: defender.DATATYPE.OBJ,
			default: {}
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

	it('can get a list of defined property names', function () {
		var list = [
			'id',
			'name',
			'number',
			'list',
			'map',
			'struct',
			'extra'
		];
		var names = test.getPropertyNames();
		var matched = 0;
		for (var i = 0, len = list.length; i < len; i++) {
			assert.notEqual(names.indexOf(list[i]), -1);
			matched += 1;
		}
		assert.equal(matched, names.length);
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
		for (var i in json) {
			assert.equal(JSON.stringify(json[i]), JSON.stringify(data[i]));
		}
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
		for (var i in json) {
			assert.equal(JSON.stringify(json[i]), JSON.stringify(data[i]));
		}
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

	it('can define date type property', function () {
		dateObj = defender.create('date');
		dateObj.define('date', {
			type: defender.DATATYPE.DATE,
			default: Date.now,
			max: new Date(Date.now() + 1000),
			min: new Date('2015-10-01 00:00:00')
		});
	});

	it('can .get() a default value of date type property', function () {
		var now = new Date();
		var d = dateObj.load();
		var def = d.get('date');
		assert.equal(def.getTime(), now.getTime());
	});

	it('cannot update date property with a value that is greater than max', function () {
		var now = new Date();
		var d = dateObj.load();
		var error = true;
		try {
			d.update('date', new Date(Date.now() + 2000));
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('can update date property with a correct value', function () {
		var now = new Date();
		var d = dateObj.load();
		var value = new Date();
		var error = false;
		try {
			d.update('date', value);
		} catch (e) {
			error = true;
		}
		assert.equal(error, false);
		assert.equal(value.getTime(), d.get('date').getTime());
	});

	it('can update date property with a correct value as unixtimestamp', function () {
		var now = new Date();
		var d = dateObj.load();
		var value = new Date();
		var error = false;
		try {
			d.update('date', value.getTime());
		} catch (e) {
			error = true;
		}
		assert.equal(error, false);
		assert.equal(value.getTime(), d.get('date').getTime());
	});

	it('cannot update date property with a value that is smaller than min', function () {
		var now = new Date();
		var d = dateObj.load();
		var error = true;
		try {
			d.update('date', new Date('2015-09-01 00:00:00'));
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update date property with a value that is greater than max in unix timestamp', function () {
		var now = new Date();
		var d = dateObj.load();
		var error = true;
		try {
			d.update('date', new Date(Date.now() + 2000).getTime());
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('cannot update date property with a value that is smaller than min in unix timestamp', function () {
		var now = new Date();
		var d = dateObj.load();
		var error = true;
		try {
			d.update('date', new Date('2015-09-01 00:00:00'));
		} catch (e) {
			error = false;
		}
		assert.equal(error, false);
	});

	it('can define a boolean property, it does NOT allow other data type to be stored and it allows boolean value to update', function () {
		var boolObj = defender.create('bool');
		boolObj.define('bool', {
			type: defender.DATATYPE.BOOL,
			default: false
		});
		var bData = boolObj.load();
		var error = true;
		try {
			bData.update('bool', 'bool');
		} catch (e) {
			error = false;
		}
		try {
			bData.update('bool', true);
			error = false;
		} catch (e) {
			error = true;
			console.error(e);
		}
		assert.equal(error, false);
		assert.equal(bData.get('bool'), true);
	});

	var testTwo;
	var testTwoMap;

	it('can define a schema and another schema as a property', function () {
		testTwo = defender.create('testTwo');
		testTwo.define('id', {
			type: defender.DATATYPE.UNIQUE
		});
		testTwo.define('text', {
			type: defender.DATATYPE.STR,
			max: 10,
			min: 0,
			default: null
		});
		testTwo.define('map', {
			type: defender.DATATYPE.OBJ,
			min: 2,
			default: null
		});
		testTwo.define('modtime', {
			type: defender.DATATYPE.MOD,
			default: Date.now
		});
		var now = Date.now();
		var d = testTwo.load();
		assert(d.get('id'));
		assert.equal(now, d.get('modtime').getTime());
		testTwoMap = defender.create('testTwoMap');
		testTwoMap.define('name', {
			type: defender.DATATYPE.STR,
			max: 4,
			min: 1,
			default: 'N/A'
		});
		testTwoMap.define('list', {
			type: defender.DATATYPE.ARR,
			max: 4,
			min: 1,
			default: [1]
		});
	});

	it('can update a propaty that w/ schema constraints', function () {
		var d = testTwo.load();
		var map = testTwoMap.load();
		var data = {
			name: 'ABCD',
			list: [1, 2]
		};
		map.update('name', data.name);
		map.update('list', data.list);
		d.update('map', map.toJSON());
		var json = d.toJSON();
		for (var i in data) {
			assert.equal(JSON.stringify(data[i]), JSON.stringify(json.map[i]));
		}
	});

	it('can load an existing data and keep the mod type data as loaded', function () {
		var then = new Date('2000-10-28 00:00:00').getTime();
		var data = {
			text: 'EFCG',
			map: { one: 1, two: 2 },
			modtime: new Date(then)
		};
		var d = testTwo.load(data);
		assert.equal(then, d.get('modtime').getTime());
	});

	it('cannot update mod type property', function () {
		var then = new Date('2000-10-28 00:00:00').getTime();
		var data = {
			text: 'EFCG',
			map: { one: 1, two: 2 },
			modtime: new Date(then)
		};
		var d = testTwo.load(data);
		var error = true;
		assert.equal(then, d.get('modtime').getTime());
		try {
			d.update('modtime', Date.now());
		} catch (e) {
			error = false;
		}
		assert.equal(then, d.get('modtime').getTime());
	});

	it('can update mod type property automatically by updating other properties', function () {
		var then = new Date('2000-10-28 00:00:00').getTime();
		var data = {
			text: 'EFCG',
			map: { one: 1, two: 2 },
			modtime: new Date(then)
		};
		var d = testTwo.load(data);
		var error = true;
		assert.equal(then, d.get('modtime').getTime());
		d.update('text', 'HIJK');
		assert.notEqual(then, d.get('modtime').getTime());
	});

	it('can disable exception throwing', function () {
		defender.returnError();
	});

	it('can define a property w/ value validation function and it can fail to update and it can successfully update', function () {
		var boo = defender.create('boo');
		boo.define('name', {
			type: defender.DATATYPE.STR,
			validation: function (value) {
				return value === 'good name';
			},
			default: 'good name'
		});
		var data = boo.load();
		var err = data.update('name', 'bad name');
		assert.equal(err instanceof Error, true);
		var success = data.update('name', 'good name');
		assert.equal(success instanceof Error, false);
	});

	it('can handle error w/o throwing and it can catch and/or detect the error from the return value', function () {
		var d = test.load({ boo: 100 });
		assert.equal((d instanceof Error), true);
	});

});
