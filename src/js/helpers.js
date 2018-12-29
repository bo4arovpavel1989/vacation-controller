'use strict'

const {API_URL, defaultFetch} = require('./config');

const handleResponse = response=>response.json().then(json=>response.ok ? json : Promise.reject(json));


const getAllIndexes = function (arr, val) {
    let indexes = [], i;

    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);

    return indexes;
}

module.exports.getAllIndexes = getAllIndexes;

/*
 * Function gets filter data for infotable
 * @returns {Object} - data defined in filter
 */
const getFilterData = function(){
  return {
    mFrom: document.getElementsByName('monthFrom')[0].value,
    mTo: document.getElementsByName('monthTo')[0].value,
    yFrom: document.getElementsByName('yearFrom')[0].value,
    yTo: document.getElementsByName('yearTo')[0].value
  }
};

module.exports.getFilterData = getFilterData;

/**
* Function calculates quantity of days in month
* @param {String} year - year to calculate dates to
* @param {String} month - month to calculate dates to
* @returns {Number} - number of days in month
*/
const getDayInMonth = function(year, month){
  // Minus 1 to start dates from 01
  return 33 - new Date(year, Number(month)-1, 33).getDate();
}

module.exports.getDayInMonth = getDayInMonth;

/**
* Function gets string name of mont
* @param {Number} num - number of month
* @returns {String} - month name
*/
const getMonthName = function(num){
  const monthNamesMap = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ]

  // Minus one - to operate monthes starting from 01
  return monthNamesMap[num-1];
}

module.exports.getMonthName = getMonthName;

/**
* Function gets all monthes from start till finish
* @param {String} m1 - month to calculate from
* @param {String} y1 - year to calculate from
* @param {String} m2 - month to calculate ti
* @param {String} y2 - year to calculate to
* @param {Number} dw - pixel width of single day element
* @returns {Array} - array of all monthes
*/
const getMiddleMonthes = function(m1, y1, m2, y2, dw){
  const monthesArray = [];
  let first = Number(m1);
  const last = Number(m2);
  let year1 = Number(y1);
  const year2 = Number(y2);

  while ((year1 < year2) || (first <= last && year1 === year2)) {
    let dayInMonth,
        monthWidth,
        month;

    if(first < 10){
      dayInMonth = getDayInMonth(year1, first)
      monthWidth = dayInMonth * dw;
      month = `0${first.toString()}`;
    } else if (first <= 12){
      dayInMonth = getDayInMonth(year1, first)
      monthWidth = dayInMonth * dw;
      month = first.toString();
    } else {
      first = 1;
      ++year1;
      dayInMonth = getDayInMonth(year1, first)
      monthWidth = dayInMonth * dw;
      month = '01';
    }

    monthesArray.push({month, dayInMonth, year:year1, monthWidth, monthName: getMonthName(first)})

    first++;
  }

  return monthesArray;
}

module.exports.getMiddleMonthes = getMiddleMonthes;

  /**
  * Function returns dates Array from monthes Array
  * @param {String} yFrom - year to start from
  * @param {Array} monthes - array of monthes
  * @returns {Array} dates - array of dates
  */
const prepareCalendar= function(yFrom, monthes){
  let currentYear = Number(yFrom);
  let dates = []

  monthes.forEach(month=>{
    const monthLength = getDayInMonth(currentYear, month.month);

      for (let i = 1; i <= monthLength; i++) {
        // To make dates like 01, 02, 03 etc
        if(i < 10)
          i = '0' + i.toString();
          dates.push({date:i.toString(), month:month.month, year: currentYear})
      }
      if(month.month === '12')
      currentYear++;
  })

  return dates;
}

module.exports.prepareCalendar = prepareCalendar;

/**
 * Function returns person vacation data
 * in the form of object ready for render in table
 * @param {Array} sortedData - array of vacation data sorted by person
 * @param {Array} dates - full array of dates from dateFrom to dateTo
 * @returns {Array} array of vacation data objects {person, daysOff:[...]}
 */
const preparePersons = function(sortedData, dates){
  const persons = [];

  sortedData.forEach((datum, i)=>{
    persons.push({person:datum.person, daysOff:[]});

    // If person has any vacation in the period
    if(datum.dateFrom) {
      dates.forEach(date=>{
        const currentDate = Date.parse(`${date.year}-${date.month}-${date.date}`);
        const dateFrom = Date.parse(datum.dateFrom);
        const dateTo = Date.parse(datum.dateTo);

        if(currentDate >= dateFrom && currentDate < dateTo)
          persons[i].daysOff.push({is:true, _id:datum._id})
        else
          persons[i].daysOff.push({is:false})
      });
    } else {
      dates.forEach(date=>{
          persons[i].daysOff.push({is:false})
      });

    }

  });

  return persons;
};

module.exports.preparePersons = preparePersons;

/*
 * Function makes member of concated vacations Array,
 * where all vacations of same person in the same arraymember
 * @param {Array} indexes - indexes of members of nonconcated array of same person vacations
 * @param {String} person - name of the person - it is his vacations
 * @param {Array} persons - noncancated initial array
 * @returns {Object} member of concated array {person, daysOff:[...]}
 */
const concatVacationsOfSinglePerson = function(indexes, person, persons){
  const firstOccassion = persons[indexes[0]];
  const {daysOff} = firstOccassion;

  // Start from 1 - coz i already performed first occassion
  for (let i = 1; i < indexes.length; i++) {
    persons[indexes[i]].daysOff.forEach((dayOff, k)=>{
      if(dayOff.is){
        daysOff[k].is = true;
        daysOff[k]._id = dayOff._id;
      }
    })
  }

  return {person, daysOff}
}

module.exports.concatVacationsOfSinglePerson = concatVacationsOfSinglePerson;

/*
 * Function concats different vacations of same person to one array
 * @param {Array} persons - non concated array, where different vacations are different array members
 * @returns {Array}concated array
 */
const concatVacations = function(persons){
  const personSet = [];
  const notConcatedArray = persons;
  const resultArray = [];
  let occassions = [];

  notConcatedArray.forEach(person=>{
    personSet.push(person.person);
  });

  notConcatedArray.forEach((person, i)=>{
    const matches = personSet.filter(personInSet=>personInSet === person.person);

    // If person runs into only once
    if(matches.length === 1)
      resultArray.push(notConcatedArray[i])
    // If person has several vacations and all his occassions havent been calculated yet
    else if(occassions.indexOf(i) === -1){
      occassions = getAllIndexes(personSet, person.person)
      resultArray.push(concatVacationsOfSinglePerson(occassions, person.person, persons))
    }
  });

  return resultArray;

}

module.exports.concatVacations = concatVacations

/**
 * Function gets form object from html and returns body object
 * for fetching to API
 * @param {object} formObj - form object got from HTML
 * @returns {object} - body object for fetching
*/
const getForm = function (formObj) {
  const fields = Object.keys(formObj);
  const formBody = {};

  fields.forEach(field=>{
    const input = formObj[field];

    if(input.type !== 'submit' && input.type !== 'checkbox'){
      formBody[input.name] = input.value
    } else if(input.type === 'checkbox') {
      // If there ara several checkboxes same name
      if(formBody[input.name] && input.checked)
        formBody[input.name].push(input.value)
      else if(input.checked)
        formBody[input.name] = [input.value]
    }
  })

  return formBody;
}

module.exports.getForm = getForm;

/**
* Function get body object and url and fetch data to API
* @param {string} url - url of API
* @param {object} data - body data object for fetching
* @returns {Promise} - response from API
*/
 const postData = function (url, data) {
  return new Promise((resolve, reject)=>{
    fetch(`${API_URL}/${url}`, defaultFetch('POST',data))
      .then(handleResponse)
      .then(rep=>resolve(rep))
      .catch(err=>reject(err))
  });
};

module.exports.postData = postData;

/**
* Fuction makes get request to API
* @param {String} url - url to request to
* @returns {Promise} - response object
*/
const getData = function (url) {
 return new Promise((resolve, reject)=>{
   fetch(`${API_URL}/${url}`, defaultFetch())
     .then(handleResponse)
     .then(rep=>resolve(rep))
     .catch(err=>reject(err))
 });
}

module.exports.getData = getData;

/**
* Fuction makes delete request to API
* @param {String} url - url to request to
* @returns {Promise} - response object
*/
const deleteData = function (url) {
 return new Promise((resolve, reject)=>{
   fetch(`${API_URL}/${url}`, defaultFetch('DELETE'))
     .then(handleResponse)
     .then(rep=>resolve(rep))
     .catch(err=>reject(err))
 });
}

module.exports.deleteData = deleteData;

/**
* Helper function for sorting array of objects by prop value
* @param {String} property - property name to sort by
* @param {Number} sortOrder - '1' or '-1' to set ascending or descendong order
* @returns {Function} sort function Array.sort()
*/
const compare = function (property, sortOrder){
  return function (a,b) {
      const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;

      return result * sortOrder;
  }
}

module.exports.compare = compare;

/**
* Function gets from API both shifts and positins data
* @returns {Promise} - array of data [[shifts], [positions]]
*/
const getObjectData = function(){
  return Promise.all([
    getData('getobject/Shift'),
    getData('getobject/Position')
  ]);
}

module.exports.getObjectData = getObjectData;

/**
* Function gets from API employe data
* @returns {Promise} - array of data [person]
*/
const getEmployeData = function(){
  return new Promise((resolve, reject)=>{
    getData('getobject/Person')
    .then(rep=>resolve(rep))
    .catch(err=>reject(err))
  })
}

module.exports.getEmployeData = getEmployeData;

/**
* Function gets from API vacation data
* @returns {Promise} - array of data [vacation]
*/
const getVacationData = function(){
  return new Promise((resolve, reject)=>{
    getData('getobject/Vacation')
    .then(rep=>resolve(rep))
    .catch(err=>reject(err))
  })
}

module.exports.getVacationData = getVacationData;

/**
* Function gets from API vacationhandout data
* @returns {Promise} - array of data [handoutdata]
*/
const getVacationHandout = function(){
  return new Promise((resolve, reject)=>{
    getData('vacationhandout')
    .then(rep=>resolve(rep))
    .catch(err=>reject(err))
  })
}

module.exports.getVacationHandout = getVacationHandout;


const selectElementContents = function(el){
  let {body} = document,
    range,
    sel;

  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(el);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(el);
      sel.addRange(range);
    }
  } else if (body.createTextRange) {
    range = body.createTextRange();
    range.moveToElementText(el);
    range.select();
  }
}

module.exports.selectElementContents = selectElementContents;
