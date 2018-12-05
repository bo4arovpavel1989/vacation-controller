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
 * @param {Object} dbFunc - database API Object
 * @returns {Promise} indicates success of the operation
 */
module.exports.editAllEmbeddedDocs = function editAllEmbeddedDocs (req){
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

  return new Promise((resolve, reject)=>{
    const {type} = req.params,
          // _id of edited doc
          {_id} = req.body,
          dependant = dependencyTree[type],
          newState = req.body;

    if(!dependant)
      resolve(false);

    // As for dependant always has only 1 property
    const [docToChange] = _.keys(dependant);
    const [propToChange] = _.values(dependant);

    // First of all - find old value of edited doc
    db.findOne(type, {_id})
      .then(rep=>{
        return Promise.resolve(rep[propToChange])
      })
      .then(propOldVal=>{
        let findProp = {},
            setProp = {$set:{}};

        // Find query for update - to find all dependant docs
        findProp[propToChange] = propOldVal;
        // $set query for update - to set new state
        setProp.$set[propToChange] = newState[propToChange];

        // Update all same values in dependant docs
        return db.update(docToChange, findProp, setProp)
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


/**
 * Function gets all positions from database
 * @returns {Promise} - array of positions
 */
module.exports.getPositions = function(){
  return new Promise((resolve, reject)=>db.find('Position', {})
      .then(rep=>resolve(rep))
      .catch(err=>reject(err)))
}

/**
 * Function gets date bounds for vacation handout calculation
 * @returns {Promise} - top bound of vacation handout date
 */
module.exports.getVacationHandoutBounds = function(){
  return new Promise((resolve, reject)=>db.findBy('Vacation', {}, {dateTo:-1}, 0, 1)
    .then(rep=>resolve(rep[0].dateTo))
    .catch(err=>reject(err)))
};

/**
 * Function generates array for dates when at least one employe is on vacation
 * @param {Date} dateTo - end date of vacation calendar
 * @returns {Promise} - array of dates
 */
module.exports.getVacationCalendar = async function(dateTo){
  const dateFrom = Date.now(),
    dateToParsed = Date.parse(dateTo),
    day = 24 * 60 * 60 * 1000;
  let currentDate = dateFrom;
  let vacationCalendar = [];

  while(currentDate < dateToParsed) {
    let vacations = await db.find('Vacation', {dateFrom: {$lte: currentDate}, dateTo: {$gt: currentDate}});

    if(vacations.length > 0) vacationCalendar.push({date:new Date(currentDate), vacations});

    currentDate += day;
  }

  return vacationCalendar;
}


/**
 * Function gets shifts that in duty this day
 * @param {Date} day - date to check for
 * @returns {Array} - array of duty shifts
 */
const getShiftOnDuty = function(day){
  let dutyShifts = [];

  return new Promise((resolve, reject)=>{
    db.find('Shift')
      .then(shifts=>{
        shifts.forEach(shift=>{
          let {off, duty} = shift,
            dutyDate = Date.parse(shift.dutyDate),
            currentDate = Date.parse(day),
            oneDay = 24 * 60 * 60 * 1000,
            // Date, when duty ends
            dutyDateEnd = dutyDate + (duty * oneDay);

          while (dutyDate <= currentDate) {

            if(dutyDate <= currentDate && dutyDateEnd > currentDate) dutyShifts.push(shift)

            dutyDate = dutyDateEnd + oneDay * off;
            dutyDateEnd = dutyDate + (duty * oneDay)
          }

        });

        resolve(dutyShifts);
      })
  });
}

module.exports.getShiftOnDuty = getShiftOnDuty;

/**
 * Function checks total quantity of persons on vacation and signs whether
 * threshold of duty person was violated
 * @param {Object} calendarDate - vacation calendar day {date: Date, vacations:Array}
 * @param {Array}  positions - positions to check
 * @returns {Array} - position with problem of total quantity vacations
 */
const checkTotalPositionsQuantity = async function(calendarDate, positions){
  let {vacations} = calendarDate;
  let problem = [];

  for (let i = 0; i < positions.length; i++){
    let {position} = positions[i];
    // Minimum employes if the position quantity threshold
    let {totalQuantity} = positions[i];
    let allPersonsOfPosition = await db.find('Person', {position});
    // Actual total quantity
    let totalDutyQuantity = allPersonsOfPosition.length;

    for (let j = 0; j < allPersonsOfPosition.length; j++){
      let {person} = allPersonsOfPosition[j];

      // If person is on vacation that day
      if(_.some(vacations, {person})) {
        totalDutyQuantity--;
      }
    }

    if(totalDutyQuantity < totalQuantity){
      problem.push(position)
    }
  }

  return problem;
}

module.exports.checkTotalPositionsQuantity = checkTotalPositionsQuantity;

/**
 * Function checks of person is on vacation this day
 * @param {String} person - name of person
 * @param {Date} date - date to check
 * @returns {Promise} - boolean represents if is on vacation
 */
const checkIfPersonOnVacation = function(person, date) {
  return new Promise((resolve, reject)=>{
    db.count('Vacation', {person, dateFrom:{$lte:date}, dateTo:{$gt: date}})
      .then(rep=>{
        resolve(rep > 0);
      })
      .catch(err=>reject(err))
  })
};

module.exports.checkIfPersonOnVacation = checkIfPersonOnVacation;

/**
 * Function arrange all employes by theri shifts
 * goal is to avoid too many data base requests
 * @returns {Promise} - objects of shifts, containing array of perons {shift1:Array, shift2:Array}
 */
const getPersonsByShift = async function(){
  let allShifts = await db.find('Shift'),
    personsByShift = {};

  for(let i = 0; i < allShifts.length; i++){
    let {shift} = allShifts[i],
      persons = await db.find('Person', {shift});

    personsByShift[shift] = persons;
  }

  return personsByShift;
}

module.exports.getPersonsByShift = getPersonsByShift;

/**
 * Function gets persons that are on duty today
 * @param {Object} personsByShift - list of employes by their shift
 * @param {Date} date - date of duty
 * @param {Array} positions - array of positions to check
 * @returns {Promise} - object containing persons on duty that day {position1:Array, position2:Array}
 */
const getDutyPersons = async function(personsByShift, date, positions){
  let dutyPersons = {},
    // Shifts that are on duty exactly that day
    shifts = await getShiftOnDuty(date);

  positions.forEach(position=>{
   dutyPersons[position.position] = [];
  });

  for (let j = 0; j < shifts.length; j++){
    let {shift} = shifts[j],
      persons = personsByShift[shift];

      for(let k = 0; k < persons.length; k++){
        let person = persons[k],
          isOnVacation = await checkIfPersonOnVacation(person.person, date);

        if(!isOnVacation) dutyPersons[person.position].push(person);
      }
  }

  return dutyPersons;
};

module.exports.getDutyPersons = getDutyPersons;

/**
 * Function checks if duty persons quantity is more than threshold
 * otherwise it pushes this position to problem array
 * @param {Object} dutyPersons - list of employes by their positions
 * @param {Array} positions - array of positions to check
 * @returns {Array} - array of objects [{shift:Array, position:String}]
 * containing positions with not enough persons if any
 */
const checkShiftPositionQuantity = function(dutyPersons, positions){
  let shiftProblem = [];

  positions.forEach(positionObject=>{
    let {position} = positionObject;

    if(dutyPersons[position].length < positionObject.shiftQuantity){
      let problem = {position};

        // Shifts that have problems
      problem.shift = new Set();

      dutyPersons[position].forEach(person=>{
          problem.shift.add(person.shift)
      })

      problem.shift = Array.from(problem.shift);

      shiftProblem.push(problem);
    }
  });


  return shiftProblem;
};

module.exports.checkShiftPositionQuantity = checkShiftPositionQuantity;

/**
 * Function loops trought vacationCalendar to check every day
 * for people who are in vacation or in duty
 * @param {Array} vacationCalendar - array of dates, when at least 1 employe is at vacation
 * @param {Array} positions - array of positions to check
 * @returns {Promise} - array of dates with problem vacations
 */
 module.exports.checkVacationCalendar = async function(vacationCalendar, positions){
  let personsByShift = await getPersonsByShift(),
    problemsCalendar = [];

   for (let i = 0; i < vacationCalendar.length; i++) {
    let problem = {
           totalProblem:[],
           shiftProblem:[],
           date:vacationCalendar[i].date
         },
      dutyPersons = await getDutyPersons(personsByShift, problem.date, positions);

    // Check positions in all shifts
    problem.totalProblem = await checkTotalPositionsQuantity(vacationCalendar[i], positions);

    // Check position in shifts in duty that day
    problem.shiftProblem = checkShiftPositionQuantity(dutyPersons, positions);

    if(problem.totalProblem.length > 0 || problem.shiftProblem.length > 0){
      problemsCalendar.push(problem)
    }
   }

   console.log(problemsCalendar);

   return problemsCalendar;
 };
