const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/react');
mongoose.Promise = global.Promise;

const models = {};

models.Shift = new mongoose.Schema({
	type:{type:String},
	shift: {type: String},
	duty:{type:Number},
	off:{type:Number},
	dutyDate:{type:Date}
});

models.Position = new mongoose.Schema({
	type:{type:String},
	position: {type: String},
	shiftQuantity:{type:Number},
	totalQuantity:{type:Number}
});


models.Shift = mongoose.model('shift', models.Shift);
models.Position = mongoose.model('position', models.Position);

module.exports = models;
