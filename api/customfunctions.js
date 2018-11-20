const db = require('./dbqueries');
const _ = require('lodash');

/**
 * Function calculates end date of Vacation
 * @param {Object} req - API request Object
 * @returns {Boolean} represents if operation successed
 */
module.exports.calculateVacationEnd = function(req){
  try {
    const {dateFrom, long} = req.body;
    const dayLong = 1000 * 60 * 60 * 24;
    const dateTo = Date.parse(dateFrom) + (long * dayLong);

    req.body.dateTo = dateTo;

    return true;
  } catch(err) {
    return false;
  }
}

/**
 * Function edits fields in other docs, that
 * contain edited field
 * @param {Object} req - API request Object
 * @returns {Promise} indicates success of the operation
 */
module.exports.editAllEmbeddedDocs = function(req){
  const dependencyTree = {
    Shift: {
      Person: 'shift'
    },
    Position:{
      Person:'position'
    },
    Person:{
      Vacation:'person'
    }
  };

  this.db = db;

  return new Promise((resolve, reject)=>{
    const {type} = req.params,
          // _id of edited doc
          {_id} = req.body,
          dependant = dependencyTree[type],
          newState = req.body;

    if(!dependant)
      resolve();

    // As for dependant always has only 1 property
    const [propToChange] = _.values(dependant);
    const [docToChange] = _.keys(dependant);

    // First of all - find old value of edited doc
    this.db.findOne(type, {_id})
      .then(rep=>{
        return Promise.resolve(rep[propToChange])
      })
      .then(propOldVal=>{
        let findProp = {},
            setProp = {$set:{}};

        // Find query for update - to find all dependant docs
        findProp[propToChange] = propOldVal;
        setProp.$set[propToChange] = newState[propToChange];

        // Update all same values in dependant docs
        console.log(findProp)
        return this.db.update(docToChange, findProp, setProp)
      })
      .then(()=>resolve(true))
      .catch(err=>reject(err.message))
  })

}

/**
 * Function calculates dates from year and month entries
 * @param {Object} body - request body Object
 * @returns {Array} - array of first and last dates [first, last]
 */
module.exports.getFullDates = function(body){
	let {monthFrom, yearFrom, monthTo, yearTo} = body;

  monthTo = Number(monthTo);
  yearTo = Number(yearTo);

  monthTo += 1;
  if(monthTo === 13) {
    monthTo = '01';
    yearTo += 1;
  } else if(monthTo < 10) {
    monthTo = '0' + monthTo.toString();
  }

  const dateFrom = `${yearFrom}-${monthFrom}-01`;
  const dateTo = `${yearTo}-${monthTo}-01`;

  return [dateFrom, dateTo];
}

/**
 * Function generates $or query for mongo to find certain shifts and positions
 * @param {Object} body - request body Object
 * @returns {Array} - array of shifts and positions [{shift, position}]
 */
module.exports.getOrQuery = function(body){
  const shifts = body.shifts || [];
  const positions = body.positions || [];
  const orQuery = [];

  shifts.forEach(shift=>{
    positions.forEach(position=>{
      orQuery.push({shift, position})
    })
  })

  return orQuery;
};

/**
 * Function gets names from Person documents of mongo
 * @param {Array} arr - array got from Person documents
 * @returns {Array} - array of names
 */
module.exports.getNamesQuery = function(arr){
  let nameArr = [];

  arr.forEach(el=>{
    nameArr.push({person: el.person})
  })

  return nameArr;
}

/**
 * Function gets $0r dates query from FromTo and dateTo
 * so that searched vacation must be between from and to
 * @param {Array} dates - array if filter dates [startDate, finishDate]
 * @returns {Array} - array of dates queries
 */
module.exports.getDatesQuery = function(dates){
  return [
    // If persons vacation starts before and ends after filter dates
    {dateFrom: {$lte:dates[0]}, dateTo:{$gte:dates[0]}},
      // If persons vacation starts between and ends whenever
    {dateFrom: {$gte:dates[0], $lt:dates[1]}}
  ]
}
