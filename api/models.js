const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/vacation-controller');
mongoose.Promise = global.Promise;

let models = {};

models.Shift = new mongoose.Schema({
  type: {type: String},
  shift: {type: String},
  // Number of duty days without days off
  duty: {type: Number},
  // Number of daysOff between duties
  off: {type: Number},
  // Date of first duty
  dutyDate: {type: Date},
  workDays: {type: Array}
});

models.Position = new mongoose.Schema({
  type: {type: String},
  position: {type: String},
  shiftQuantity: {type: Number},
  totalQuantity: {type: Number}
});

models.Person = new mongoose.Schema({
  type: {type: String},
  person: {type: String},
  shift: {type: String},
  position: {type: String}
});

models.Vacation = new mongoose.Schema({
  type: {type: String},
  person: {type: String},
  dateFrom: {type: Date},
  dateTo: {type: Date},
  long: {type: Number}
});

models.ProblemsCalendar = new mongoose.Schema({
  data:{type:Array},
  updated:{type:Date},
  needToUpdate:{type:Boolean}
});


for (let schema of Object.keys(models)) {
  models[schema] = mongoose.model(schema.toLowerCase(), models[schema])
}

module.exports = models;