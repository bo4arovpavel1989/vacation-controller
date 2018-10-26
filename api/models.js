const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/react');
mongoose.Promise = global.Promise;

let models = {};

models.Shift = new mongoose.Schema({
	type: {type:String},
	shift: {type: String},
	duty: {type:Number},
	off: {type:Number},
	dutyDate: {type:Date}
});

models.Position = new mongoose.Schema({
	type: {type:String},
	position: {type: String},
	shiftQuantity: {type:Number},
	totalQuantity: {type:Number}
});

models.Person = new mongoose.Schema({
	type: {type:String},
	person: {type: String},
	shift: {type:String},
	position: {type:String}
});

for (let schema of Object.keys(models)) {
	models[schema] = mongoose.model(schema.toLowerCase(), models[schema])
}

module.exports = models;
