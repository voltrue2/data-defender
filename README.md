# data-defender

A node.js module to let you define and enforce data constraints.

## API

### .create(schemaName [string])

Returns a schema object to allow you to define constraints on each data property.

It will throw an error if trying to create a schema that has already been created.

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
	max: 30,
	min: 4
});
```

### .get(schemaName [string])

Returns an already defined schema object.

It will throw an exception if trying to get a schema that has not been created.

**Example**:

```javascript
var example = defender.get('example');
```

### Schema Object

It is an instance of Struct class.

This object allows you to define constraints on each data property.

#### .define(PropertyName [string], constraints [object])

If there is an error, it will throw an exception.

**constraints**:

```
{
	type: [enum],
	default: [*default value],
	max: [*number],
	min: [*number] 
}
```

##### type [enum]

Defines the data type of the property.

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
```

**NOTE**: `UNIQUE` data type's value cannot be updated.

##### default [*default value]

An optional value to define a default value for the property.

##### max [*number]

An optional value to define the maximum value for the property.

##### min [*number]

An optional value to define the minimum value for the property.

#### .lockSchema()

Locks the definition of schema. If you call `.define()` after invoking this function, it will throw an excetion.

#### .load(data [*object])

It loads the data and returns a data object.

If the given values do not meet the constraints defined by the schema, it will throw an exception.

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

