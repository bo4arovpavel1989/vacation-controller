const db = require('./dbqueries');
const _ = require('lodash');

/**
 * Function rounds value to set precition
 * @param {Number} value - to round
 * @param {Number} step - precision
 * @returns {Number} rounded number
 */
const round = function (value, step){
    step || (step = 1.0);
    const inv = 1.0 / step;

    return Math.round(value * inv) / inv;
};

/**
 * Function calculates end date of Vacation
 * @param {Object} req - API request Object
 * @returns {Boolean} represents if operation successed
 */
const calculateVacationEnd = function(req){
  try {
    const {dateFrom, long} = req.body;
    const dayLong = 1000 * 60 * 60 * 24;
    const dateTo = Date.parse(dateFrom) + long * dayLong;

    req.body.dateTo = dateTo;

    return true;
  } catch(err) {
    return false;
  }
}

/**
 * Function marks Problemscalendar as needed to update
 * when changes in vacation
 * @returns {Promise} boolean represents success of operation
 */
const markProblemscalendar = async function(){
  try {
    await db.update('ProblemsCalendar', {}, {$set: {needToUpdate: true}});

    return true;
  } catch(err){
    return false;
  }
}

module.exports.calculateVacationEnd = calculateVacationEnd;

/**
 * Function handles middleware function for adding vacations route
 * @param {Object} req - request object
 * @returns {Promise} representing success status of the operation
 */
module.exports.prehandleVacation = function(req){
  return new Promise((resolve, reject)=>{
    Promise.all([
      Promise.resolve(calculateVacationEnd(req)),
      markProblemscalendar()
    ])
    .then(reps=>{
      // Represents all operations were success
      resolve(reps.every(el=>el));
    })
    .catch(err=>reject(err));
  });
};

/**
 * Function handles middleware function for editing positions
 * when edited position it s necessary to refresh problemscalendar
 * @returns {Promise} representing success status of the operation
 */
module.exports.prehandlePosition = function(){
  console.log('Prehandling position...');

  return new Promise((resolve, reject)=>{
    markProblemscalendar()
      .then(rep=>resolve(rep))
      .catch(err=>reject(err))
  });
};

/**
 * Function edits fields in other docs, that
 * contain edited field
 * @param {Object} req - API request Object
 * @param {Object} dbFunc - database API Object
 * @returns {Promise} indicates success of the operation
 */
module.exports.editAllEmbeddedDocs = function editAllEmbeddedDocs (req){
  const dependencyTree = {
    Shift: {Person: 'shift'},
    Position:{Person:'position'},
    Person:{Vacation:'person'}
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
      .then(rep=>Promise.resolve(rep[propToChange]))
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
    monthTo = `0${monthTo.toString()}`;
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
 * Function concats all names array with array of vacations
 * so that we can see all persons of certaion shift and position
 * when rendering in the infotable
 * @param {Array} namesArray - array of persons of the certain shift and position
 * @param {Aray} vacationsArray - array of the persons's vacations of certain time period
 * @returns {Array} concated array
 */
module.exports.concatPersonArrays = function(namesArray, vacationsArray){
  try{
    namesArray.forEach(nameObj=>{
      const {person} = nameObj;

      if(!_.some(vacationsArray, {person})) vacationsArray.push({person})
    });

    return vacationsArray;
  } catch(e){
    throw new Error(e);
  }
};


/**
 * Function gets all positions from database
 * @returns {Promise} - array of positions
 */
const getPositions = function(){
  return new Promise((resolve, reject)=>db.find('Position', {})
      .then(rep=>resolve(rep))
      .catch(err=>reject(err)))
}

module.exports.getPositions = getPositions;

/**
 * Function gets date bounds for vacation handout calculation
 * @returns {Promise} - top bound of vacation handout date
 */
const getVacationHandoutBounds = function(){
  return new Promise((resolve, reject)=>db.findBy('Vacation', {}, {dateTo:-1}, 0, 1)
    .then(rep=>resolve(rep[0].dateTo))
    .catch(err=>reject(err)))
};

module.exports.getVacationHandoutBounds = getVacationHandoutBounds;

/**
 * Function sets for all shifts their duty dates
 * as close as possible to Date.now()
 * @param {Boolean} refreshDb - if true - updates data base document
 * @param {Date} date - date to update to
 * @returns {Promise} representing status of the operation
 */
const refreshShiftsDuties = async function(refreshDb, date){
  const shifts = await db.find('Shift'),
    currentDate = Date.parse(date) || Date.now();

  for (let i = 0; i < shifts.length; i++) {
    const shift = shifts[i],
      oneDay = 24 * 60 * 60 * 1000;
    let {dutyDate, off, duty, _id} = shift;

    dutyDate = Date.parse(dutyDate);

    let dutyDateEnd = dutyDate + duty * oneDay,
      prevDutyDate = dutyDate;

    while(dutyDate < currentDate){
      prevDutyDate = dutyDate;
      dutyDate = dutyDateEnd + oneDay * off;
      dutyDateEnd = dutyDate + duty * oneDay;
    }

    dutyDate = prevDutyDate;

    shift.dutyDate = new Date(prevDutyDate);

    if(refreshDb) await db.update('Shift', {_id}, {$set:{dutyDate}});
  }

  return shifts;
};

module.exports.refreshShiftsDuties = refreshShiftsDuties;

/**
 * Function generates array for dates when at least one employe is on vacation
 * @param {Date} dateTo - end date of vacation calendar
 * @returns {Promise} - array of dates
 */
const getVacationCalendar = async function(dateTo){
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

module.exports.getVacationCalendar=getVacationCalendar;

/**
 * Function gets shifts that in duty this day
 * @param {Date} day - date to check for
 * @param {Array} allShifts - array of shifts ibjects from db
 * @returns {Array} - array of duty shifts
 */
const getShiftOnDuty = function(day, allShifts){
  let dutyShifts = [];

  allShifts.forEach(shift=>{
    let {off, duty} = shift,
      dutyDate = Date.parse(shift.dutyDate),
      currentDate = Date.parse(day),
      oneDay = 24 * 60 * 60 * 1000,
      // Date, when duty ends
      dutyDateEnd = dutyDate + duty * oneDay;

    while (dutyDate <= currentDate) {
      if(dutyDate <= currentDate && dutyDateEnd > currentDate) dutyShifts.push(shift)
          dutyDate = dutyDateEnd + oneDay * off;
          dutyDateEnd = dutyDate + duty * oneDay
      }

    });

    return dutyShifts;
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
 * @param {Object} vacationDate - object containing vacation date and array of vacations
 * @returns {Boolean} - boolean represents if is on vacation
 */
const checkIfPersonOnVacation = function(person, vacationDate) {
  return _.some(vacationDate.vacations, {person})
};

module.exports.checkIfPersonOnVacation = checkIfPersonOnVacation;

/**
 * Function arrange all employes by theri shifts
 * goal is to avoid too many data base requests
 * @param {Array} allShifts - array of shifts [{shift, duty, off, dutyDate}]
 * @returns {Promise} - objects of shifts, containing array of perons {shift1:Array, shift2:Array}
 */
const getPersonsByShift = async function(allShifts){
  let personsByShift = {};

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
 * @param {Object} vacationDate -  - object containing vacation date and array of vacations
 * @param {Array} shifts - array of duty shifts
 * @param {Array} positions - array of positions to check
 * @returns {Object} - object containing persons on duty that day {position1:Array, position2:Array}
 */
const getDutyPersons = function(personsByShift, vacationDate, shifts, positions){
  let dutyPersons = {};

  positions.forEach(position=>{
   dutyPersons[position.position] = [];
  });

  for (let j = 0; j < shifts.length; j++){
    let {shift} = shifts[j],
      persons = personsByShift[shift];

      for(let k = 0; k < persons.length; k++){
        let person = persons[k],
          isOnVacation = checkIfPersonOnVacation(person.person, vacationDate);

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
 * @param {Array} dutyShifts - array of shifts on duty that day
 * @returns {Array} - array of objects [{shift:Array, position:String}]
 * containing positions with not enough persons if any
 */
const checkShiftPositionQuantity = function(dutyPersons, positions, dutyShifts){
  let shiftProblem = [];

  positions.forEach(positionObject=>{
    let {position} = positionObject;

    if(dutyPersons[position].length < positionObject.shiftQuantity){
      let problem = {position, shift:[]};

      dutyShifts.forEach(shiftObj=>problem.shift.push(shiftObj.shift));
      shiftProblem.push(problem);
    }
  });


  return shiftProblem;
};

module.exports.checkShiftPositionQuantity = checkShiftPositionQuantity;

/**
 * Function loops trought vacationCalendar to check every day
 * for people who are in vacation or in duty
 * @param {Array} vacationCalendar - array of objects with date, when at least 1 employe is at vacation
 * @param {Array} positions - array of positions to check
 * @returns {Promise} - array of dates with problem vacations
 */
 const checkVacationCalendar = async function(vacationCalendar, positions){
  let allShifts = await db.find('Shift'),
    personsByShift = await getPersonsByShift(allShifts),
    problemsCalendar = [];

   for (let i = 0; i < vacationCalendar.length; i++) {
    let problem = {
           totalProblem:[],
           shiftProblem:[],
           date:vacationCalendar[i].date
         },
      dutyShifts = await getShiftOnDuty(vacationCalendar[i].date, allShifts),
      dutyPersons = getDutyPersons(personsByShift, vacationCalendar[i], dutyShifts, positions);

    // Check positions in all shifts
    problem.totalProblem = await checkTotalPositionsQuantity(vacationCalendar[i], positions);

    // Check position in shifts in duty that day
    problem.shiftProblem = checkShiftPositionQuantity(dutyPersons, positions, dutyShifts);

    if(problem.totalProblem.length > 0 || problem.shiftProblem.length > 0){
      problemsCalendar.push(problem)
    }
   }

   return problemsCalendar;
 };

module.exports.checkVacationCalendar = checkVacationCalendar;


/**
 * Function updates problemsCalendar
 * @returns {Promise} -array of dates with position problems
 */
module.exports.getNewProblemsCalendar = async function(){
  await refreshShiftsDuties(true);

  let positions = await getPositions(),
    dateTo = await getVacationHandoutBounds(),
    vacationCalendar = await getVacationCalendar(dateTo),
    problemsCalendar = await checkVacationCalendar(vacationCalendar, positions);

    db.update(
'ProblemsCalendar', {}, {
        $set:{
          data: problemsCalendar,
          updated: new Date(),
          needToUpdate: false
        }
      },
      {upsert:true}
    );

    console.log('Getting new problemsCalendar');

    return problemsCalendar;
};

/**
 * Function gets shifts from db and calculates duty calendar
 * based on dates array [dateFrom, dateTo]
 * @param {Array} dates - [dateFrom, dateTo]
 * @returns {Promise} array of dates with duty shifts
 */
module.exports.getDutyCalendar = async function(dates){
  let [dateFrom, dateTo] = dates;
  const calendar = [],
    dayLong = 1000 * 60 * 60 * 24,
    shifts = await refreshShiftsDuties(false, dateFrom);

  dateFrom = Date.parse(dateFrom);
  dateTo = Date.parse(dateTo);

  let currentDate = dateFrom;

  while(currentDate < dateTo){
    calendar.push({date: new Date(currentDate), shift:[]});
    currentDate += dayLong;
  }

  calendar.forEach((thatDay, i)=>{
    const dutyShifts = getShiftOnDuty(thatDay.date, shifts);

    dutyShifts.forEach(shiftObj=>{
      const {shift} = shiftObj;

      thatDay.shift.push(shift);
    });
  });

  return calendar;
};

// Functions for getXraySchedule


/**
 * Functin gets max period between duties of all all shifts
 * @param {Array} shifts - array of all shifts
 * @returns {Number} - value of max period between duties
 */
const getMaxShiftPeriod = function(shifts){
  const periods = [];

  shifts.forEach(shift=>periods.push(shift.duty + shift.off));

  return periods.reduce((max, current)=>Math.max(max, current), 0);
};

module.exports.getMaxShiftPeriod = getMaxShiftPeriod;

/**
 * Function gets shifts that work same day
 * @returns {Promise} - array of shifts grouped by state of working same day
 */
const getMutualShifts = async function(){
  const shifts = await db.find('Shift'),
    maxShiftPeriod = getMaxShiftPeriod(shifts),
    oneDay = 24 * 60 * 60 * 1000,
    mutualShifts = [];
  let currentDate = Date.now();

  for (let i = 0; i < maxShiftPeriod; i++){
    let dutyShifts = getShiftOnDuty(new Date(currentDate), shifts);

    // To unfreeze mongodoc object
    mutualShifts.push(JSON.parse(JSON.stringify(dutyShifts)));
    currentDate += oneDay;
  }

  return mutualShifts;
};

module.exports.getMutualShifts = getMutualShifts;

const sortMutualShifts = function(mutualShifts){
  mutualShifts.forEach(shiftPair=>{
    shiftPair.sort((a, b)=>{
      if (a.shift > b.shift)return 1;
      if (a.shift < b.shift) return -1;

      return 0;
    });
  });

  mutualShifts.sort((a, b)=>{
    let sort = 0;

    for (let i = 0; i < a.length; i++){
      if (a[i].shift > b[i].shift) sort = 1;
      if (a[i].shift < b[i].shift) sort = -1;
    }

    return sort;
  });
};


/**
 * Function calculates how many times each shifts work
 * per period when every shift work at least 1 time
 * @param {Array} mutualShifts - array of shifts grouped by working same day
 * @returns {Array} updated input array - added param periodTimes
 */
const calculateTimesPerPeriod = function(mutualShifts){
  mutualShifts.forEach(shiftPairs=>{
    shiftPairs.forEach(shiftToCheck=>{
      const {shift} = shiftToCheck;

      shiftToCheck.periodTimes = shiftToCheck.periodTimes || 0;

      mutualShifts.forEach(shifts=>{
        if(_.some(shifts, {shift})) shiftToCheck.periodTimes += 1;
      });
    })
  });

  return mutualShifts;
};

module.exports.calculateTimesPerPeriod = calculateTimesPerPeriod;

/**
 * Function get mutualShifts array and calculate show many people of position
 * work in every shift
 * @param {Array} mutualShifts - array to loop through
 * @param {String} position - position to calculate to
 * @returns {Promise} array - updated mutualShifts array
 */
const calculatePeopleOfPosition = async function(mutualShifts, position){
  for(let i = 0; i < mutualShifts.length; i++) {
    const shiftPair = mutualShifts[i];

    for (let j = 0; j < shiftPair.length; j++) {
      const shiftObj = shiftPair[j]

      if(!shiftObj.howMany) {
        const {shift} = shiftObj;

        shiftObj.howMany = await db.count('Person', {shift, position});
      }
    }
  }

  return mutualShifts;
};

module.exports.calculatePeopleOfPosition = calculatePeopleOfPosition;

/**
 * Function gets mutualShift array and calculates
 * relation of how many people of position to
 * how many times shift works per period
 * @param {Array} mutualShifts - array of shifts
 * @return {Array} - updated mutualShifts array
 */
const calculatePeopleShiftRelation = function(mutualShifts){
  mutualShifts.forEach(shiftPair=>{
    shiftPair.forEach(shift=>{
      if(!shift.peopleShiftRelation)
        shift.peopleShiftRelation = shift.howMany / shift.periodTimes;
    });
  });

  return mutualShifts;
};

module.exports.calculatePeopleShiftRelation = calculatePeopleShiftRelation;

/**
 * Function calculates within each group in mutualShifts
 * relation of potential men power, i.e.
 * relation of each shift's peopleShiftRelation to sum of peopleShiftRelation
 * @param {Array} mutualShifts - array -of shifts
 * @return {Array} - updated mutualShifts array
 */
const getShiftPowerRelation = function(mutualShifts){
  mutualShifts.forEach(shiftPair=>{
    let sum = 0;

    shiftPair.forEach(shift=>{
      sum += shift.peopleShiftRelation;
    });

    shiftPair.forEach(shift=>{
      shift.potentialMenPower = shift.peopleShiftRelation / sum;
    });
  });

  return mutualShifts;
};

module.exports.getShiftPowerRelation = getShiftPowerRelation;

/**
 * Function multiplies potentialMenPower of each mutualShifts array member
 * to calculate every day quantity of hours
 * @param {Array} calendar - array of sum hours for all duty shifts
 * @param {Array} mutualShifts - array of shifts grouped by duties
 * @returns {Array} array of hours for each shift for each day of week
 */
const calculateXrayCalendar = function(calendar, mutualShifts){
  const xrayCalendar = [];
  const week = [
    'понедельник',
    'вторник',
    'среда',
    'четверг',
    'пятница',
    'суббота',
    'воскресенье'
  ]

  calendar.forEach((dayHours, i)=>{
    const shiftHours = [week[i]];

    mutualShifts.forEach(shiftPair=>{
      shiftPair.forEach(shift=>{
        let hourForShift = shift.potentialMenPower * Number(dayHours);

        hourForShift = round(hourForShift, 0.5);
        shiftHours.push(hourForShift);
      });

      // To mark separator
      shiftHours.push(false);
    });

    xrayCalendar.push(shiftHours);
  });

  return xrayCalendar;
};

module.exports.calculateXrayCalendar = calculateXrayCalendar;

/**
 * Function gets week shift schedule based on hours quantity each day
 * @param {Object} body - request body object
 * @returns {Promise} week object with certain hours quantity for each shift
 */
module.exports.getXraySchedule = async function(body){
  const {position} = body;
  const mutualShifts = await getMutualShifts();
  const calendar = [
    body.monday,
    body.thuesday,
    body.wednesday,
    body.thursday,
    body.friday,
    body.saturday,
    body.sunday
  ];

  sortMutualShifts(mutualShifts);
  calculateTimesPerPeriod(mutualShifts);
  await calculatePeopleOfPosition(mutualShifts, position);
  calculatePeopleShiftRelation(mutualShifts);
  getShiftPowerRelation(mutualShifts);

  const xraySchedule = calculateXrayCalendar(calendar, mutualShifts);

  return [xraySchedule, mutualShifts];
};
