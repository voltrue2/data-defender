# data-defender

A node.js module to let you define and enforce data constraints.

The module is database-agnostic.

The module is also ideal for evaludating incoming request paramters for servers such as HTTP.

**NOTE**: This module alone does NOT store data in a database and it does NOT read from any database.

## How To Install

`npm install data-defencer`

## API

### .returnError()

Enable the module to return errors instead of throwing exceptions.

### .create(schemaName [string])

Returns a schema object to allow you to define constraints on each data property.

It will return an error if trying to create a schema that has already been created.

**Example**:

```javascript
var defender = require('data-defender');
var example = defender.create('example');

example.define('id', {
	type: defender.DATATYPE.UNIQUE
});
example.define('name', {
	type: defender.DATATYPE.STR,
	default: 'No Name',
	validation: myValidationFunction,
	max: 30,
	min: 4
});
```

### .get(schemaName [string])

Returns an already defined schema object.

It will return an error if trying to get a schema that has not been created.

**Example**:

```javascript
var example = defender.get('example');
```

### Schema Object

It is an instance of Struct class.

This object allows you to define constraints on each data property.

#### .define(PropertyName [string], constraints [object])

If there is an error, it will return an error.

**constraints**:

```
{
	type: [enum],
	default: [*default value],
	validation: [*function],
	max: [*number or date],
	min: [*number or date] 
}
```

##### type [enum]

Defines the data type of the property.

This is required.

The possible values are:

```javascript
var defender = require('data-defender');

// number type
defender.DATATYPE.NUM;

// string type
defender.DATATYPE.STR;

// array type
defender.DATATYPE.ARR;

// object type
defender.DATATYPE.OBJ;

// unique type
defender.DATATYPE.UNIQUE;

// date type
defender.DATATYPE.DATE;

// boolean type
defender.DATATYPE.BOOL;

// modified time type
defender.DATATYPE.MOD;

```

**NOTE 1**: `UNIQUE` and `MOD` data type's value cannot be updated.

**NOTE 2**: `MOD` data type property will be updated automatically by updating other properties.

##### default [*default value]

An optional value to define a default value for the property.

**NOTE**: By setting this value to `null`, you can allow `null` value for this property.

##### validation [*function]

An optional function used to validated the value for the property.

The validation function is given the value as an argument.

**NOTE**: Validation function can only performce synchronous operations.

**Example**:

```javascript
var defender = require('data-defender');
var validate = function (value) {
	// only odd numbers
	return value % 2 !== 0;
};
var example = defender.create('example');
example.define('oddNum', {
	type: defender.DATATYPE.NUM,
	validation: validate,
	default: 1,
	min: 1,
	max: 99
});
```

##### max [*number or date]

An optional value to define the maximum value for the property.

##### min [*number or date]

An optional value to define the minimum value for the property.

#### .lockSchema()

Locks the definition of schema. If you call `.define()` after invoking this function, it will throw an excetion.

#### .getPropertyNames()

Returns an array of defined property names.

#### .load(data [*object])

It loads the data and returns a data object.

If the given values do not meet the constraints defined by the schema, it will return an error.

**NOTE**: If you define a property that is `UNIQUE` and pass nothing to `.load()`, it will auto-generate a unique ID as a string.

**Example**:

```javascript
var defender = require('data-defender');
var mySchema = defender.create('mySchema');
mySchema.define('id', {
	type: defender.DATATYPE.UNIQUE
});
mySchema.define('name', {
	type: defender.DATATYPE.STR,
	max: 30,
	min: 1
});
mySchema.define('age', {
	type: defender.DATATYPE.NUM,
	min: 0
});

var dbRecord = mySchema.load(dataFromDatabase);
```

#### Data Object

An instance of Data class. This object allows you
to change the property values of the data loaded according to the schema constraints defined.

**Example**:

```javascript
var defender = require('data-defender');
var mySchema = defender.create('mySchema');
mySchema.define('id', {
	type: defender.DATATYPE.UNIQUE
});
mySchema.define('name', {
	type: defender.DATATYPE.STR,
	max: 30,
	min: 1
});
mySchema.define('age', {
	type: defender.DATATYPE.NUM,
	min: 0
});

var dbRecord = mySchema.load(dataFromDatabase);
dbRecord.update('name', 'New Name');
dbRecord.update('age', dbRecord.get('age') + 4);
```

##### .update(propertyName [string], value [mix])

Updates the property value of the `name` given with the value passed to the function.

##### .get(propertyName [string])

Returns the current value of the given property.

##### .toJSON()

Returns all the property along with their values as an object.

Useful when you need to store the data to database etc.

**Example**:

```javascript
var dataToSave = myData.toJSON();
saveToDatabase(dataToSave, callback);
```

