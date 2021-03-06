(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

const EventEmitter = require('./libs/events.min');
const Handlebars = require('./libs/h.min');
const {postData, deleteData, getForm, getData} = require('./helpers');

/**
* Class made to handle all button calling popup forms and handle submits
* Form must be wrapped in div with class 'popup' and id made by concat of
* the calling button data-form plus 'FormArea'
* the callong buttons must have data-form attr
* Class 'popedUp' must be defined in css for showing popups
* Class container must be in html to trigger closepopup on click
*/
 module.exports = class FormsHandler {

  /**
    * Create listener.
    * @param {Object} selectors - selectors of controlled buttons and forms
    */
  constructor(selectors){
    this.popupButtonSelector = selectors.popupButtonSelector || '.popupButton';
    // Must be ClassName!!!
    this.formsSelector = selectors.formsSelector || '.defaultFormm';
    this.deleteSelector = selectors.deleteSelector || '.deleteObject';
    this.editSelector = selectors.editSelector || '.editObject';
    this.editFormSelector = selectors.editFormSelector || '#editForm';
    this.isPopup = false;
    this.ee = new EventEmitter();
    this.addListeners();
  }

  /**
  * Adds listeners for clicking and submitting
  * @returns {void}
  */
  addListeners(){
    const popupButtons = document.querySelectorAll(this.popupButtonSelector);
    const addForms = document.querySelectorAll(this.formsSelector);
    const deleteLinks = document.querySelectorAll(this.deleteSelector);
    const editLinks = document.querySelectorAll(this.editSelector);

    popupButtons.forEach(button=>{
      if(!button.dataset.hasPopupListener) {
        button.addEventListener('click', e=>this.popupButtonClickHandler(e, button.dataset.form))
        button.dataset.hasPopupListener = true;
      }
    });

    addForms.forEach(form=>{
      if(!form.dataset.hasSubmitListener) {
        form.addEventListener('submit', e=>this.formHandler(e))
        form.dataset.hasSubmitListener = true;
      }
    });

    deleteLinks.forEach(link=>{
      if(!link.dataset.hasDeleteListener) {
        link.addEventListener('click', e=>this.deleteHandler(e))
        link.dataset.hasDeleteListener = true;
      }
    });

    editLinks.forEach(link=>{
      if(!link.dataset.hasEditListener) {
        link.addEventListener('click', e=>this.editLinkHandler(e, link.dataset.form));
        link.dataset.hasEditListener = true;
      }
    });

    const container = document.getElementById('container');

    if(container && !container.dataset.hasClickListener){
      container.addEventListener('click', ()=>this.closePopup());
      container.dataset.hasClickListener = true;
    }

  }


  /**
  * Adds all listeners if not any
  * @returns {void}
  */
  refreshListeners(){
    this.addListeners();
  }

  /**
  * Close all popups
  * @returns {void}
  */
  closePopup(){
    if(this.isPopup){
      const popups = document.querySelectorAll('.popup');

      this.isPopup = false;
      popups.forEach(p=>{
        p.classList.remove('popedUp');
      })
    }
  }

  /**
  * Adds class 'popedUp' to certain FormArea
  * @param {Object} e - event Object
  * @param {string} form - data-form attr of popup button
  * @returns {void}
  */
  openPopup(e, form){
    const el = document.getElementById(`${form}FormArea`);
    
    this.isPopup = true;
    el.style.left = `${e.x}px`;
    el.style.top = `${e.layerY}px`;
    setTimeout(()=>el.classList.add('popedUp'), 10);
  }

  /**
  * Handles click on button and popups its form
  * Closes all previous popups if any
  * @param {Object} e - event Object
  * @param {String} form - selector of its form to open
  * @returns {void}
  */
  popupButtonClickHandler(e, form){
    e.stopPropagation();
    this.closePopup();
    this.openPopup(e, form);
  }

  /**
  * Submits form
  * @param {Object} e - event object
  * @returns {void}
  */
  formHandler(e){
    e.preventDefault();

    postData(e.target.dataset.url, getForm(e.target))
      .then(rep=>{
        this.closePopup();
        this.emit('refreshRender', rep);
      })
      .catch(err=>console.log(err))
  }

  /**
  * Send delete request and then emits that object deleted to refresh state
  * @param {String} e - url for delete request
  * @returns {void}
  */
  deleteHandler(e){
    if(confirm('Вы уверены?'))
      deleteData(e.target.dataset.url)
        .then(()=>{
          this.emit('refreshRender');
        })
        .catch(err=>console.log(err))
  }

  /**
  * Send delete request and then emits that object deleted to refresh state
  * @param {Object} e - event object
  * @param {string} form - edit link data-form attr for `${form}FormArea` to render to
  * @returns {void}
  */
  editLinkHandler(e, form){
    const obj = {
      id: e.target.dataset.id,
      object: e.target.dataset.object
    };

    getData(`getobject/${obj.object}/${obj.id}`)
      .then(rep=>this.renderEditForm(rep[0], form))
      .catch(err=>console.log(err));
  }

  /**
  * Get API response object, transfirm it amd render in Handlebars
  * @param {Object} obj - API response object
  * @param {string} form - selector for `${form}FormArea` to render to
  * @returns {void}
  */
  renderEditForm(obj, form){
    const renderData = this.transformObjectForRender(obj);
    const source = document.querySelector(this.editFormSelector).innerHTML;
    const template = Handlebars.compile(source);
    const context = renderData;
    const html = template(context);

    document.getElementById(`${form}FormArea`).innerHTML = html;
    this.refreshListeners();
  }

  /**
  * Gets response object from API and transform it to object for render in forms
  * @param {Object} obj - respoinse object from API
  * @returns {Object} - object for render in form
  */
  transformObjectForRender(obj){
    const renderObject = {
      object:obj.type,
      id:obj._id,
      // Slice(1) - to eliminate '.' symbol of class selector
      className: this.formsSelector.slice(1),
      input:[]
     };
    const typesMap = {
      string: 'text',
      number: 'number',
      date: 'date'
    }

    for (const i in obj) {
      if(i !== 'type' && i !== '_id' && i !== 'workDays') {
        const input = {name:i};

        if(typeof obj[i] !== 'string'){
          input.type = typesMap[typeof obj[i]];
          input.value = obj[i];
        } else if (obj[i].split('T')[0].match(/\d\d\d\d-\d\d-\d\d/)) {
          input.type='date';
          [input.value] = obj[i].split('T');
        } else {
          input.type='text';
          input.value = obj[i];
        }

        renderObject.input.push(input);
      }
    }

    return renderObject;
  }

  emit(message, data){
    this.ee.emit(message, data);
  }

}
},{"./helpers":5,"./libs/events.min":8,"./libs/h.min":10}],2:[function(require,module,exports){
'use strict'

const FormsHandler = require('./FormsHandler');
const Handlebars = require('./libs/h.min');
const {HandlebarsIntl} = require('./libs/h-intl.min');
const {compare, getObjectData, getEmployeData, getVacationData, selectElementContents} = require('./helpers');

HandlebarsIntl.registerWith(Handlebars);

/**
* Class made to handle standart page behavior:
* getting data from API and rendering it
*/
module.exports = class PageScript {
  constructor(selectors){
    this.formsHandler = new FormsHandler(selectors);

    this.getObjectData = this.getObjectData.bind(this);
    this.getEmployeData = this.getEmployeData.bind(this);
    this.getVacationData = this.getVacationData.bind(this);
    this.handleObjectData = this.handleObjectData.bind(this);
    this.handleEmployeData = this.handleEmployeData.bind(this);
    this.handleVacationData = this.handleVacationData.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.setSort = this.setSort.bind(this);
    this.setSortValue = this.setSortValue.bind(this);

    // Default sort
    this.sort = 'person';
    this.sortValue = 1;
    this.sortEl = document.getElementById('setSort');
    this.sortValEl = document.getElementById('sortValue');

    // Default clipboard copy button settings
    this.clipBoardButton = document.getElementById('clipboardCopy');

    this.setSortListeners();
    this.setClipboardCopyListener();
  }

  setSortListeners(){
    if(this.sortEl && this.sortValEl) {
      this.sortEl.addEventListener('change', this.setSort);
      this.sortValEl.addEventListener('click', this.setSortValue);
    }
  }

  setSort(){
      this.sort = this.sortEl.value;
      const dataAttr = this.sortEl.parentElement.dataset;

      this.sortAndRender(dataAttr.entry, dataAttr.area);
  }

  setSortValue(){
    const contentMap = {
        '1': '&uarr;',
        '-1': '&darr;'
      };

    const dataAttr = this.sortValEl.parentElement.dataset;

    this.sortValue *= -1;
    const stringSortValue = this.sortValue.toString();

    this.sortValEl.innerHTML = contentMap[stringSortValue];
    this.sortAndRender(dataAttr.entry, dataAttr.area);
  }

  setClipboardCopyListener(){
    if(this.clipBoardButton) {
      this.clipBoardButton.addEventListener('click', this.copyToClipboard)
    }
  }

  copyToClipboard(){
    const copyArea = this.clipBoardButton.dataset.target;

    selectElementContents(document.getElementById(copyArea));
    document.execCommand('copy');
  }

  getObjectData(){
    return getObjectData()
      .then(this.handleObjectData)
      .catch(err=>console.log(err));
  }

  getEmployeData(){
    return getEmployeData()
      .then(this.handleEmployeData)
      .catch(err=>console.log(err));
  }

  getVacationData(){
    return getVacationData()
      .then(this.handleVacationData)
      .catch(err=>console.log(err));
  }

  handleObjectData(){
    return null;
  }

  handleEmployeData(){
    return null;
  }

  handleVacationData(){
    return null;
  }

  sortAndRender(entry, selector){

    this[entry] = this[entry].sort(compare(this.sort, this.sortValue));
    this.render(entry, selector);
  }

  render(data, selector){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(selector).innerHTML = html;
    this.formsHandler.refreshListeners();
  }
}

},{"./FormsHandler":1,"./helpers":5,"./libs/h-intl.min":9,"./libs/h.min":10}],3:[function(require,module,exports){
'use strict'

module.exports.API_URL = 'http://K47_8:9200';

module.exports.getPage = function() {
  const idElement = document.getElementById('pageId');

  return idElement.dataset.id;
}

module.exports.defaultFetch = function(method='GET', body){
  const configFetch = {
      method,
      mode:'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

  if(body) Object.assign(configFetch, {body:JSON.stringify(body)})

  return configFetch;
}

},{}],4:[function(require,module,exports){
'use strict'

const PageScript = require('./PageScript');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.person=[];
    this.shift=[];
    this.position=[];

    this.setListeners();

    this.getObjectData();

    this.getEmployeData();
  }

  handleEmployeData(rep){
    this.person=rep;

    this.sortAndRender('person', 'personSelect');
  }

  handleObjectData(reps){
    [this.shift, this.position] = reps;

    this.sortAndRender('shift', 'shiftSelect');
    this.sortAndRender('position', 'positionSelect');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.getEmployeData);
  }
}
},{"./PageScript":2}],5:[function(require,module,exports){
'use strict'

const {API_URL, defaultFetch} = require('./config');

const handleResponse = response=>response.json().then(json=>response.ok ? json : Promise.reject(json));


const getAllIndexes = function (arr, val) {
    let indexes = [], 
i;

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
    'Декабрь'
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

  while (year1 < year2 || first <= last && year1 === year2) {
    let dayInMonth,
        month,
        monthWidth;

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
  const dates = []

  monthes.forEach(month=>{
    const monthLength = getDayInMonth(currentYear, month.month);

      for (let i = 1; i <= monthLength; i++) {
        // To make dates like 01, 02, 03 etc
        if(i < 10)
          i = `0${i.toString()}`;
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
      const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

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
},{"./config":3}],6:[function(require,module,exports){
'use strict';

const {getPage} = require('./config');
const ObjectManagment = require('./objectManagment');
const VacationManagment = require('./vacationManagment');
const Infotable = require('./infotable');
const EmployeManagment = require('./employeManagment');
const ShiftCalendar = require('./shiftCalendar');
const XraySchedule = require('./xrayschedule');
let pageScript;

switch(getPage()) {
  case 'objectManagment':
    pageScript = new ObjectManagment({
      formsSelector: '.objectManagmentForm'
    });
    break;
  case 'vacationManagment':
    pageScript = new VacationManagment({
      formsSelector: '.vacationManagmentForm'
    });
    break;
  case 'infotable':
    pageScript = new Infotable({
      formsSelector: '.filterManagmentForm'
    });
    break;
  case 'employeManagment':
    pageScript = new EmployeManagment({
      formsSelector: '.employeManagmentForm'
    });
    break;
  case 'shiftCalendar':
    pageScript = new ShiftCalendar({
      formsSelector: '.filterManagmentForm'
    });
    break;
  case 'xraySchedule':
    pageScript = new XraySchedule({
      formsSelector: '.setDayHoursForm'
    });
    break;
  default:
    pageScript = null;
}
},{"./config":3,"./employeManagment":4,"./infotable":7,"./objectManagment":11,"./shiftCalendar":12,"./vacationManagment":13,"./xrayschedule":14}],7:[function(require,module,exports){
'use strict'

const {compare,
  getMiddleMonthes,
  prepareCalendar,
  preparePersons,
  getFilterData,
  concatVacations
} = require('./helpers');
const PageScript = require('./PageScript');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shift=[];
    this.position=[];

    this.defaults = {
      title:'',
      dayWidth:20,
      calendar: {
        monthes:[],
        dates:[]
      },
      persons:[]
    };
    this.graphData=this.defaults;

    this.getObjectData();

    this.setListeners();
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', data=>this.prepareGraphData(data));
  }

  handleObjectData(reps){
    [this.shift, this.position] = reps;

    this.sortAndRender('shift', 'shiftsSelect');
    this.sortAndRender('position', 'positionsSelect');
  }

  clearGraphData(){
    this.graphData=this.defaults;
  }

  /**
   * Function sorts vacation data by name and
   * makes of array of dutyDays and daysOff
   * concats data and renders
   * @param {Array} data - data got from API
   * @returns {void}
   */
  prepareGraphData(data){
    this.clearGraphData();


    const {mFrom, mTo, yFrom, yTo} = getFilterData();
    const {dayWidth} = this.graphData;

    this.graphData.calendar.monthes = getMiddleMonthes(mFrom, yFrom, mTo, yTo, dayWidth);


    const {monthes} = this.graphData.calendar;

    this.graphData.calendar.dates = prepareCalendar(yFrom, monthes);


    const {dates} = this.graphData.calendar;
    const sortedData = data.sort(compare('person', this.sortValue));
    const persons = preparePersons(sortedData, dates);

    this.graphData.persons = concatVacations(persons)


    this.graphData.title = `График отпусков ${mFrom}-${yFrom} - ${mTo}-${yTo}`;

    this.render('graphData', 'graphDataField');
  }
}
},{"./PageScript":2,"./helpers":5}],8:[function(require,module,exports){
"use strict";function ProcessEmitWarning(e){console&&console.warn&&console.warn(e)}function EventEmitter(){EventEmitter.init.call(this)}function $getMaxListeners(e){return void 0===e._maxListeners?EventEmitter.defaultMaxListeners:e._maxListeners}function _addListener(e,t,n,r){var i,o,s;if("function"!=typeof n)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof n);if(o=e._events,void 0===o?(o=e._events=Object.create(null),e._eventsCount=0):(void 0!==o.newListener&&(e.emit("newListener",t,n.listener?n.listener:n),o=e._events),s=o[t]),void 0===s)s=o[t]=n,++e._eventsCount;else if("function"==typeof s?s=o[t]=r?[n,s]:[s,n]:r?s.unshift(n):s.push(n),(i=$getMaxListeners(e))>0&&s.length>i&&!s.warned){s.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+s.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=s.length,ProcessEmitWarning(u)}return e}function onceWrapper(){for(var e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);this.fired||(this.target.removeListener(this.type,this.wrapFn),this.fired=!0,ReflectApply(this.listener,this.target,e))}function _onceWrap(e,t,n){var r={fired:!1,wrapFn:void 0,target:e,type:t,listener:n},i=onceWrapper.bind(r);return i.listener=n,r.wrapFn=i,i}function _listeners(e,t,n){var r=e._events;if(void 0===r)return[];var i=r[t];return void 0===i?[]:"function"==typeof i?n?[i.listener||i]:[i]:n?unwrapListeners(i):arrayClone(i,i.length)}function listenerCount(e){var t=this._events;if(void 0!==t){var n=t[e];if("function"==typeof n)return 1;if(void 0!==n)return n.length}return 0}function arrayClone(e,t){for(var n=new Array(t),r=0;r<t;++r)n[r]=e[r];return n}function spliceOne(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}function unwrapListeners(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}var R="object"==typeof Reflect?Reflect:null,ReflectApply=R&&"function"==typeof R.apply?R.apply:function(e,t,n){return Function.prototype.apply.call(e,t,n)},ReflectOwnKeys;ReflectOwnKeys=R&&"function"==typeof R.ownKeys?R.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var NumberIsNaN=Number.isNaN||function(e){return e!==e};module.exports=EventEmitter,EventEmitter.EventEmitter=EventEmitter,EventEmitter.prototype._events=void 0,EventEmitter.prototype._eventsCount=0,EventEmitter.prototype._maxListeners=void 0;var defaultMaxListeners=10;Object.defineProperty(EventEmitter,"defaultMaxListeners",{enumerable:!0,get:function(){return defaultMaxListeners},set:function(e){if("number"!=typeof e||e<0||NumberIsNaN(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");defaultMaxListeners=e}}),EventEmitter.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},EventEmitter.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||NumberIsNaN(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},EventEmitter.prototype.getMaxListeners=function(){return $getMaxListeners(this)},EventEmitter.prototype.emit=function(e){for(var t=[],n=1;n<arguments.length;n++)t.push(arguments[n]);var r="error"===e,i=this._events;if(void 0!==i)r=r&&void 0===i.error;else if(!r)return!1;if(r){var o;if(t.length>0&&(o=t[0]),o instanceof Error)throw o;var s=new Error("Unhandled error."+(o?" ("+o.message+")":""));throw s.context=o,s}var u=i[e];if(void 0===u)return!1;if("function"==typeof u)ReflectApply(u,this,t);else for(var f=u.length,v=arrayClone(u,f),n=0;n<f;++n)ReflectApply(v[n],this,t);return!0},EventEmitter.prototype.addListener=function(e,t){return _addListener(this,e,t,!1)},EventEmitter.prototype.on=EventEmitter.prototype.addListener,EventEmitter.prototype.prependListener=function(e,t){return _addListener(this,e,t,!0)},EventEmitter.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);return this.on(e,_onceWrap(this,e,t)),this},EventEmitter.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);return this.prependListener(e,_onceWrap(this,e,t)),this},EventEmitter.prototype.removeListener=function(e,t){var n,r,i,o,s;if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);if(void 0===(r=this._events))return this;if(void 0===(n=r[e]))return this;if(n===t||n.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete r[e],r.removeListener&&this.emit("removeListener",e,n.listener||t));else if("function"!=typeof n){for(i=-1,o=n.length-1;o>=0;o--)if(n[o]===t||n[o].listener===t){s=n[o].listener,i=o;break}if(i<0)return this;0===i?n.shift():spliceOne(n,i),1===n.length&&(r[e]=n[0]),void 0!==r.removeListener&&this.emit("removeListener",e,s||t)}return this},EventEmitter.prototype.off=EventEmitter.prototype.removeListener,EventEmitter.prototype.removeAllListeners=function(e){var t,n,r;if(void 0===(n=this._events))return this;if(void 0===n.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==n[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete n[e]),this;if(0===arguments.length){var i,o=Object.keys(n);for(r=0;r<o.length;++r)"removeListener"!==(i=o[r])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=n[e]))this.removeListener(e,t);else if(void 0!==t)for(r=t.length-1;r>=0;r--)this.removeListener(e,t[r]);return this},EventEmitter.prototype.listeners=function(e){return _listeners(this,e,!0)},EventEmitter.prototype.rawListeners=function(e){return _listeners(this,e,!1)},EventEmitter.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):listenerCount.call(e,t)},EventEmitter.prototype.listenerCount=listenerCount,EventEmitter.prototype.eventNames=function(){return this._eventsCount>0?ReflectOwnKeys(this._events):[]};
},{}],9:[function(require,module,exports){
(function(){"use strict";function a(a){var b,c,d,e,f=Array.prototype.slice.call(arguments,1);for(b=0,c=f.length;c>b;b+=1)if(d=f[b])for(e in d)p.call(d,e)&&(a[e]=d[e]);return a}function b(a,b,c){this.locales=a,this.formats=b,this.pluralFn=c}function c(a){this.id=a}function d(a,b,c,d,e){this.id=a,this.useOrdinal=b,this.offset=c,this.options=d,this.pluralFn=e}function e(a,b,c,d){this.id=a,this.offset=b,this.numberFormat=c,this.string=d}function f(a,b){this.id=a,this.options=b}function g(a,b,c){var d="string"==typeof a?g.__parse(a):a;if(!d||"messageFormatPattern"!==d.type)throw new TypeError("A message must be provided as a String or AST.");c=this._mergeFormats(g.formats,c),r(this,"_locale",{value:this._resolveLocale(b)});var e=this._findPluralRuleFunction(this._locale),f=this._compilePattern(d,b,c,e),h=this;this.format=function(a){return h._format(f,a)}}function h(a){return 400*a/146097}function i(a,b){b=b||{},G(a)&&(a=a.concat()),D(this,"_locale",{value:this._resolveLocale(a)}),D(this,"_options",{value:{style:this._resolveStyle(b.style),units:this._isValidUnits(b.units)&&b.units}}),D(this,"_locales",{value:a}),D(this,"_fields",{value:this._findFields(this._locale)}),D(this,"_messages",{value:E(null)});var c=this;this.format=function(a,b){return c._format(a,b)}}function j(a){var b=R(null);return function(){var c=Array.prototype.slice.call(arguments),d=k(c),e=d&&b[d];return e||(e=new(N.apply(a,[null].concat(c))),d&&(b[d]=e)),e}}function k(a){if("undefined"!=typeof JSON){var b,c,d,e=[];for(b=0,c=a.length;c>b;b+=1)d=a[b],e.push(d&&"object"==typeof d?l(d):d);return JSON.stringify(e)}}function l(a){var b,c,d,e,f=[],g=[];for(b in a)a.hasOwnProperty(b)&&g.push(b);var h=g.sort();for(c=0,d=h.length;d>c;c+=1)b=h[c],e={},e[b]=a[b],f[c]=e;return f}function m(a){var b,c,d,e,f=Array.prototype.slice.call(arguments,1);for(b=0,c=f.length;c>b;b+=1)if(d=f[b])for(e in d)d.hasOwnProperty(e)&&(a[e]=d[e]);return a}function n(a){function b(a,b){return function(){return"undefined"!=typeof console&&"function"==typeof console.warn&&console.warn("{{"+a+"}} is deprecated, use: {{"+b.name+"}}"),b.apply(this,arguments)}}function c(a){if(!a.fn)throw new Error("{{#intl}} must be invoked as a block helper");var b=p(a.data),c=m({},b.intl,a.hash);return b.intl=c,a.fn(this,{data:b})}function d(a,b){var c,d,e,f=b.data&&b.data.intl,g=a.split(".");try{for(e=0,d=g.length;d>e;e++)c=f=f[g[e]]}finally{if(void 0===c)throw new ReferenceError("Could not find Intl object: "+a)}return c}function e(a,b,c){a=new Date(a),k(a,"A date or timestamp must be provided to {{formatDate}}"),c||(c=b,b=null);var d=c.data.intl&&c.data.intl.locales,e=n("date",b,c);return U(d,e).format(a)}function f(a,b,c){a=new Date(a),k(a,"A date or timestamp must be provided to {{formatTime}}"),c||(c=b,b=null);var d=c.data.intl&&c.data.intl.locales,e=n("time",b,c);return U(d,e).format(a)}function g(a,b,c){a=new Date(a),k(a,"A date or timestamp must be provided to {{formatRelative}}"),c||(c=b,b=null);var d=c.data.intl&&c.data.intl.locales,e=n("relative",b,c),f=c.hash.now;return delete e.now,W(d,e).format(a,{now:f})}function h(a,b,c){l(a,"A number must be provided to {{formatNumber}}"),c||(c=b,b=null);var d=c.data.intl&&c.data.intl.locales,e=n("number",b,c);return T(d,e).format(a)}function i(a,b){b||(b=a,a=null);var c=b.hash;if(!a&&"string"!=typeof a&&!c.intlName)throw new ReferenceError("{{formatMessage}} must be provided a message or intlName");var e=b.data.intl||{},f=e.locales,g=e.formats;return!a&&c.intlName&&(a=d(c.intlName,b)),"function"==typeof a?a(c):("string"==typeof a&&(a=V(a,f,g)),a.format(c))}function j(){var a,b,c=[].slice.call(arguments).pop(),d=c.hash;for(a in d)d.hasOwnProperty(a)&&(b=d[a],"string"==typeof b&&(d[a]=q(b)));return new o(String(i.apply(this,arguments)))}function k(a,b){if(!isFinite(a))throw new TypeError(b)}function l(a,b){if("number"!=typeof a)throw new TypeError(b)}function n(a,b,c){var e,f=c.hash;return b?("string"==typeof b&&(e=d("formats."+a+"."+b,c)),e=m({},e,f)):e=f,e}var o=a.SafeString,p=a.createFrame,q=a.Utils.escapeExpression,r={intl:c,intlGet:d,formatDate:e,formatTime:f,formatRelative:g,formatNumber:h,formatMessage:i,formatHTMLMessage:j,intlDate:b("intlDate",e),intlTime:b("intlTime",f),intlNumber:b("intlNumber",h),intlMessage:b("intlMessage",i),intlHTMLMessage:b("intlHTMLMessage",j)};for(var s in r)r.hasOwnProperty(s)&&a.registerHelper(s,r[s])}function o(a){x.__addLocaleData(a),M.__addLocaleData(a)}var p=Object.prototype.hasOwnProperty,q=function(){try{return!!Object.defineProperty({},"a",{})}catch(a){return!1}}(),r=(!q&&!Object.prototype.__defineGetter__,q?Object.defineProperty:function(a,b,c){"get"in c&&a.__defineGetter__?a.__defineGetter__(b,c.get):(!p.call(a,b)||"value"in c)&&(a[b]=c.value)}),s=Object.create||function(a,b){function c(){}var d,e;c.prototype=a,d=new c;for(e in b)p.call(b,e)&&r(d,e,b[e]);return d},t=b;b.prototype.compile=function(a){return this.pluralStack=[],this.currentPlural=null,this.pluralNumberFormat=null,this.compileMessage(a)},b.prototype.compileMessage=function(a){if(!a||"messageFormatPattern"!==a.type)throw new Error('Message AST is not of type: "messageFormatPattern"');var b,c,d,e=a.elements,f=[];for(b=0,c=e.length;c>b;b+=1)switch(d=e[b],d.type){case"messageTextElement":f.push(this.compileMessageText(d));break;case"argumentElement":f.push(this.compileArgument(d));break;default:throw new Error("Message element does not have a valid type")}return f},b.prototype.compileMessageText=function(a){return this.currentPlural&&/(^|[^\\])#/g.test(a.value)?(this.pluralNumberFormat||(this.pluralNumberFormat=new Intl.NumberFormat(this.locales)),new e(this.currentPlural.id,this.currentPlural.format.offset,this.pluralNumberFormat,a.value)):a.value.replace(/\\#/g,"#")},b.prototype.compileArgument=function(a){var b=a.format;if(!b)return new c(a.id);var e,g=this.formats,h=this.locales,i=this.pluralFn;switch(b.type){case"numberFormat":return e=g.number[b.style],{id:a.id,format:new Intl.NumberFormat(h,e).format};case"dateFormat":return e=g.date[b.style],{id:a.id,format:new Intl.DateTimeFormat(h,e).format};case"timeFormat":return e=g.time[b.style],{id:a.id,format:new Intl.DateTimeFormat(h,e).format};case"pluralFormat":return e=this.compileOptions(a),new d(a.id,b.ordinal,b.offset,e,i);case"selectFormat":return e=this.compileOptions(a),new f(a.id,e);default:throw new Error("Message element does not have a valid format type")}},b.prototype.compileOptions=function(a){var b=a.format,c=b.options,d={};this.pluralStack.push(this.currentPlural),this.currentPlural="pluralFormat"===b.type?a:null;var e,f,g;for(e=0,f=c.length;f>e;e+=1)g=c[e],d[g.selector]=this.compileMessage(g.value);return this.currentPlural=this.pluralStack.pop(),d},c.prototype.format=function(a){return a?"string"==typeof a?a:String(a):""},d.prototype.getOption=function(a){var b=this.options,c=b["="+a]||b[this.pluralFn(a-this.offset,this.useOrdinal)];return c||b.other},e.prototype.format=function(a){var b=this.numberFormat.format(a-this.offset);return this.string.replace(/(^|[^\\])#/g,"$1"+b).replace(/\\#/g,"#")},f.prototype.getOption=function(a){var b=this.options;return b[a]||b.other};var u=function(){function a(a,b){function c(){this.constructor=a}c.prototype=b.prototype,a.prototype=new c}function b(a,b,c,d,e,f){this.message=a,this.expected=b,this.found=c,this.offset=d,this.line=e,this.column=f,this.name="SyntaxError"}function c(a){function c(b){function c(b,c,d){var e,f;for(e=c;d>e;e++)f=a.charAt(e),"\n"===f?(b.seenCR||b.line++,b.column=1,b.seenCR=!1):"\r"===f||"\u2028"===f||"\u2029"===f?(b.line++,b.column=1,b.seenCR=!0):(b.column++,b.seenCR=!1)}return Ua!==b&&(Ua>b&&(Ua=0,Va={line:1,column:1,seenCR:!1}),c(Va,Ua,b),Ua=b),Va}function d(a){Wa>Sa||(Sa>Wa&&(Wa=Sa,Xa=[]),Xa.push(a))}function e(d,e,f){function g(a){var b=1;for(a.sort(function(a,b){return a.description<b.description?-1:a.description>b.description?1:0});b<a.length;)a[b-1]===a[b]?a.splice(b,1):b++}function h(a,b){function c(a){function b(a){return a.charCodeAt(0).toString(16).toUpperCase()}return a.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\x08/g,"\\b").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f").replace(/\r/g,"\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function(a){return"\\x0"+b(a)}).replace(/[\x10-\x1F\x80-\xFF]/g,function(a){return"\\x"+b(a)}).replace(/[\u0180-\u0FFF]/g,function(a){return"\\u0"+b(a)}).replace(/[\u1080-\uFFFF]/g,function(a){return"\\u"+b(a)})}var d,e,f,g=new Array(a.length);for(f=0;f<a.length;f++)g[f]=a[f].description;return d=a.length>1?g.slice(0,-1).join(", ")+" or "+g[a.length-1]:g[0],e=b?'"'+c(b)+'"':"end of input","Expected "+d+" but "+e+" found."}var i=c(f),j=f<a.length?a.charAt(f):null;return null!==e&&g(e),new b(null!==d?d:h(e,j),e,j,f,i.line,i.column)}function f(){var a;return a=g()}function g(){var a,b,c;for(a=Sa,b=[],c=h();c!==E;)b.push(c),c=h();return b!==E&&(Ta=a,b=H(b)),a=b}function h(){var a;return a=j(),a===E&&(a=l()),a}function i(){var b,c,d,e,f,g;if(b=Sa,c=[],d=Sa,e=w(),e!==E?(f=B(),f!==E?(g=w(),g!==E?(e=[e,f,g],d=e):(Sa=d,d=I)):(Sa=d,d=I)):(Sa=d,d=I),d!==E)for(;d!==E;)c.push(d),d=Sa,e=w(),e!==E?(f=B(),f!==E?(g=w(),g!==E?(e=[e,f,g],d=e):(Sa=d,d=I)):(Sa=d,d=I)):(Sa=d,d=I);else c=I;return c!==E&&(Ta=b,c=J(c)),b=c,b===E&&(b=Sa,c=v(),c!==E&&(c=a.substring(b,Sa)),b=c),b}function j(){var a,b;return a=Sa,b=i(),b!==E&&(Ta=a,b=K(b)),a=b}function k(){var b,c,e;if(b=z(),b===E){if(b=Sa,c=[],L.test(a.charAt(Sa))?(e=a.charAt(Sa),Sa++):(e=E,0===Ya&&d(M)),e!==E)for(;e!==E;)c.push(e),L.test(a.charAt(Sa))?(e=a.charAt(Sa),Sa++):(e=E,0===Ya&&d(M));else c=I;c!==E&&(c=a.substring(b,Sa)),b=c}return b}function l(){var b,c,e,f,g,h,i,j,l;return b=Sa,123===a.charCodeAt(Sa)?(c=N,Sa++):(c=E,0===Ya&&d(O)),c!==E?(e=w(),e!==E?(f=k(),f!==E?(g=w(),g!==E?(h=Sa,44===a.charCodeAt(Sa)?(i=Q,Sa++):(i=E,0===Ya&&d(R)),i!==E?(j=w(),j!==E?(l=m(),l!==E?(i=[i,j,l],h=i):(Sa=h,h=I)):(Sa=h,h=I)):(Sa=h,h=I),h===E&&(h=P),h!==E?(i=w(),i!==E?(125===a.charCodeAt(Sa)?(j=S,Sa++):(j=E,0===Ya&&d(T)),j!==E?(Ta=b,c=U(f,h),b=c):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I),b}function m(){var a;return a=n(),a===E&&(a=o(),a===E&&(a=p(),a===E&&(a=q()))),a}function n(){var b,c,e,f,g,h,i;return b=Sa,a.substr(Sa,6)===V?(c=V,Sa+=6):(c=E,0===Ya&&d(W)),c===E&&(a.substr(Sa,4)===X?(c=X,Sa+=4):(c=E,0===Ya&&d(Y)),c===E&&(a.substr(Sa,4)===Z?(c=Z,Sa+=4):(c=E,0===Ya&&d($)))),c!==E?(e=w(),e!==E?(f=Sa,44===a.charCodeAt(Sa)?(g=Q,Sa++):(g=E,0===Ya&&d(R)),g!==E?(h=w(),h!==E?(i=B(),i!==E?(g=[g,h,i],f=g):(Sa=f,f=I)):(Sa=f,f=I)):(Sa=f,f=I),f===E&&(f=P),f!==E?(Ta=b,c=_(c,f),b=c):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I),b}function o(){var b,c,e,f,g,h;return b=Sa,a.substr(Sa,6)===aa?(c=aa,Sa+=6):(c=E,0===Ya&&d(ba)),c!==E?(e=w(),e!==E?(44===a.charCodeAt(Sa)?(f=Q,Sa++):(f=E,0===Ya&&d(R)),f!==E?(g=w(),g!==E?(h=u(),h!==E?(Ta=b,c=ca(h),b=c):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I),b}function p(){var b,c,e,f,g,h;return b=Sa,a.substr(Sa,13)===da?(c=da,Sa+=13):(c=E,0===Ya&&d(ea)),c!==E?(e=w(),e!==E?(44===a.charCodeAt(Sa)?(f=Q,Sa++):(f=E,0===Ya&&d(R)),f!==E?(g=w(),g!==E?(h=u(),h!==E?(Ta=b,c=fa(h),b=c):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I),b}function q(){var b,c,e,f,g,h,i;if(b=Sa,a.substr(Sa,6)===ga?(c=ga,Sa+=6):(c=E,0===Ya&&d(ha)),c!==E)if(e=w(),e!==E)if(44===a.charCodeAt(Sa)?(f=Q,Sa++):(f=E,0===Ya&&d(R)),f!==E)if(g=w(),g!==E){if(h=[],i=s(),i!==E)for(;i!==E;)h.push(i),i=s();else h=I;h!==E?(Ta=b,c=ia(h),b=c):(Sa=b,b=I)}else Sa=b,b=I;else Sa=b,b=I;else Sa=b,b=I;else Sa=b,b=I;return b}function r(){var b,c,e,f;return b=Sa,c=Sa,61===a.charCodeAt(Sa)?(e=ja,Sa++):(e=E,0===Ya&&d(ka)),e!==E?(f=z(),f!==E?(e=[e,f],c=e):(Sa=c,c=I)):(Sa=c,c=I),c!==E&&(c=a.substring(b,Sa)),b=c,b===E&&(b=B()),b}function s(){var b,c,e,f,h,i,j,k,l;return b=Sa,c=w(),c!==E?(e=r(),e!==E?(f=w(),f!==E?(123===a.charCodeAt(Sa)?(h=N,Sa++):(h=E,0===Ya&&d(O)),h!==E?(i=w(),i!==E?(j=g(),j!==E?(k=w(),k!==E?(125===a.charCodeAt(Sa)?(l=S,Sa++):(l=E,0===Ya&&d(T)),l!==E?(Ta=b,c=la(e,j),b=c):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I),b}function t(){var b,c,e,f;return b=Sa,a.substr(Sa,7)===ma?(c=ma,Sa+=7):(c=E,0===Ya&&d(na)),c!==E?(e=w(),e!==E?(f=z(),f!==E?(Ta=b,c=oa(f),b=c):(Sa=b,b=I)):(Sa=b,b=I)):(Sa=b,b=I),b}function u(){var a,b,c,d,e;if(a=Sa,b=t(),b===E&&(b=P),b!==E)if(c=w(),c!==E){if(d=[],e=s(),e!==E)for(;e!==E;)d.push(e),e=s();else d=I;d!==E?(Ta=a,b=pa(b,d),a=b):(Sa=a,a=I)}else Sa=a,a=I;else Sa=a,a=I;return a}function v(){var b,c;if(Ya++,b=[],ra.test(a.charAt(Sa))?(c=a.charAt(Sa),Sa++):(c=E,0===Ya&&d(sa)),c!==E)for(;c!==E;)b.push(c),ra.test(a.charAt(Sa))?(c=a.charAt(Sa),Sa++):(c=E,0===Ya&&d(sa));else b=I;return Ya--,b===E&&(c=E,0===Ya&&d(qa)),b}function w(){var b,c,e;for(Ya++,b=Sa,c=[],e=v();e!==E;)c.push(e),e=v();return c!==E&&(c=a.substring(b,Sa)),b=c,Ya--,b===E&&(c=E,0===Ya&&d(ta)),b}function x(){var b;return ua.test(a.charAt(Sa))?(b=a.charAt(Sa),Sa++):(b=E,0===Ya&&d(va)),b}function y(){var b;return wa.test(a.charAt(Sa))?(b=a.charAt(Sa),Sa++):(b=E,0===Ya&&d(xa)),b}function z(){var b,c,e,f,g,h;if(b=Sa,48===a.charCodeAt(Sa)?(c=ya,Sa++):(c=E,0===Ya&&d(za)),c===E){if(c=Sa,e=Sa,Aa.test(a.charAt(Sa))?(f=a.charAt(Sa),Sa++):(f=E,0===Ya&&d(Ba)),f!==E){for(g=[],h=x();h!==E;)g.push(h),h=x();g!==E?(f=[f,g],e=f):(Sa=e,e=I)}else Sa=e,e=I;e!==E&&(e=a.substring(c,Sa)),c=e}return c!==E&&(Ta=b,c=Ca(c)),b=c}function A(){var b,c,e,f,g,h,i,j;return Da.test(a.charAt(Sa))?(b=a.charAt(Sa),Sa++):(b=E,0===Ya&&d(Ea)),b===E&&(b=Sa,a.substr(Sa,2)===Fa?(c=Fa,Sa+=2):(c=E,0===Ya&&d(Ga)),c!==E&&(Ta=b,c=Ha()),b=c,b===E&&(b=Sa,a.substr(Sa,2)===Ia?(c=Ia,Sa+=2):(c=E,0===Ya&&d(Ja)),c!==E&&(Ta=b,c=Ka()),b=c,b===E&&(b=Sa,a.substr(Sa,2)===La?(c=La,Sa+=2):(c=E,0===Ya&&d(Ma)),c!==E&&(Ta=b,c=Na()),b=c,b===E&&(b=Sa,a.substr(Sa,2)===Oa?(c=Oa,Sa+=2):(c=E,0===Ya&&d(Pa)),c!==E?(e=Sa,f=Sa,g=y(),g!==E?(h=y(),h!==E?(i=y(),i!==E?(j=y(),j!==E?(g=[g,h,i,j],f=g):(Sa=f,f=I)):(Sa=f,f=I)):(Sa=f,f=I)):(Sa=f,f=I),f!==E&&(f=a.substring(e,Sa)),e=f,e!==E?(Ta=b,c=Qa(e),b=c):(Sa=b,b=I)):(Sa=b,b=I))))),b}function B(){var a,b,c;if(a=Sa,b=[],c=A(),c!==E)for(;c!==E;)b.push(c),c=A();else b=I;return b!==E&&(Ta=a,b=Ra(b)),a=b}var C,D=arguments.length>1?arguments[1]:{},E={},F={start:f},G=f,H=function(a){return{type:"messageFormatPattern",elements:a}},I=E,J=function(a){var b,c,d,e,f,g="";for(b=0,d=a.length;d>b;b+=1)for(e=a[b],c=0,f=e.length;f>c;c+=1)g+=e[c];return g},K=function(a){return{type:"messageTextElement",value:a}},L=/^[^ \t\n\r,.+={}#]/,M={type:"class",value:"[^ \\t\\n\\r,.+={}#]",description:"[^ \\t\\n\\r,.+={}#]"},N="{",O={type:"literal",value:"{",description:'"{"'},P=null,Q=",",R={type:"literal",value:",",description:'","'},S="}",T={type:"literal",value:"}",description:'"}"'},U=function(a,b){return{type:"argumentElement",id:a,format:b&&b[2]}},V="number",W={type:"literal",value:"number",description:'"number"'},X="date",Y={type:"literal",value:"date",description:'"date"'},Z="time",$={type:"literal",value:"time",description:'"time"'},_=function(a,b){return{type:a+"Format",style:b&&b[2]}},aa="plural",ba={type:"literal",value:"plural",description:'"plural"'},ca=function(a){return{type:a.type,ordinal:!1,offset:a.offset||0,options:a.options}},da="selectordinal",ea={type:"literal",value:"selectordinal",description:'"selectordinal"'},fa=function(a){return{type:a.type,ordinal:!0,offset:a.offset||0,options:a.options}},ga="select",ha={type:"literal",value:"select",description:'"select"'},ia=function(a){return{type:"selectFormat",options:a}},ja="=",ka={type:"literal",value:"=",description:'"="'},la=function(a,b){return{type:"optionalFormatPattern",selector:a,value:b}},ma="offset:",na={type:"literal",value:"offset:",description:'"offset:"'},oa=function(a){return a},pa=function(a,b){return{type:"pluralFormat",offset:a,options:b}},qa={type:"other",description:"whitespace"},ra=/^[ \t\n\r]/,sa={type:"class",value:"[ \\t\\n\\r]",description:"[ \\t\\n\\r]"},ta={type:"other",description:"optionalWhitespace"},ua=/^[0-9]/,va={type:"class",value:"[0-9]",description:"[0-9]"},wa=/^[0-9a-f]/i,xa={type:"class",value:"[0-9a-f]i",description:"[0-9a-f]i"},ya="0",za={type:"literal",value:"0",description:'"0"'},Aa=/^[1-9]/,Ba={type:"class",value:"[1-9]",description:"[1-9]"},Ca=function(a){return parseInt(a,10)},Da=/^[^{}\\\0-\x1F \t\n\r]/,Ea={type:"class",value:"[^{}\\\\\\0-\\x1F \\t\\n\\r]",description:"[^{}\\\\\\0-\\x1F \\t\\n\\r]"},Fa="\\#",Ga={type:"literal",value:"\\#",description:'"\\\\#"'},Ha=function(){return"\\#"},Ia="\\{",Ja={type:"literal",value:"\\{",description:'"\\\\{"'},Ka=function(){return"{"},La="\\}",Ma={type:"literal",value:"\\}",description:'"\\\\}"'},Na=function(){return"}"},Oa="\\u",Pa={type:"literal",value:"\\u",description:'"\\\\u"'},Qa=function(a){return String.fromCharCode(parseInt(a,16))},Ra=function(a){return a.join("")},Sa=0,Ta=0,Ua=0,Va={line:1,column:1,seenCR:!1},Wa=0,Xa=[],Ya=0;if("startRule"in D){if(!(D.startRule in F))throw new Error("Can't start parsing from rule \""+D.startRule+'".');G=F[D.startRule]}if(C=G(),C!==E&&Sa===a.length)return C;throw C!==E&&Sa<a.length&&d({type:"end",description:"end of input"}),e(null,Xa,Wa)}return a(b,Error),{SyntaxError:b,parse:c}}(),v=g;r(g,"formats",{enumerable:!0,value:{number:{currency:{style:"currency"},percent:{style:"percent"}},date:{"short":{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},"long":{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{"short":{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},"long":{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}}}),r(g,"__localeData__",{value:s(null)}),r(g,"__addLocaleData",{value:function(a){if(!a||!a.locale)throw new Error("Locale data provided to IntlMessageFormat is missing a `locale` property");g.__localeData__[a.locale.toLowerCase()]=a}}),r(g,"__parse",{value:u.parse}),r(g,"defaultLocale",{enumerable:!0,writable:!0,value:void 0}),g.prototype.resolvedOptions=function(){return{locale:this._locale}},g.prototype._compilePattern=function(a,b,c,d){var e=new t(b,c,d);return e.compile(a)},g.prototype._findPluralRuleFunction=function(a){for(var b=g.__localeData__,c=b[a.toLowerCase()];c;){if(c.pluralRuleFunction)return c.pluralRuleFunction;c=c.parentLocale&&b[c.parentLocale.toLowerCase()]}throw new Error("Locale data added to IntlMessageFormat is missing a `pluralRuleFunction` for :"+a)},g.prototype._format=function(a,b){var c,d,e,f,g,h="";for(c=0,d=a.length;d>c;c+=1)if(e=a[c],"string"!=typeof e){if(f=e.id,!b||!p.call(b,f))throw new Error("A value must be provided for: "+f);g=b[f],h+=e.options?this._format(e.getOption(g),b):e.format(g)}else h+=e;return h},g.prototype._mergeFormats=function(b,c){var d,e,f={};for(d in b)p.call(b,d)&&(f[d]=e=s(b[d]),c&&p.call(c,d)&&a(e,c[d]));return f},g.prototype._resolveLocale=function(a){"string"==typeof a&&(a=[a]),a=(a||[]).concat(g.defaultLocale);var b,c,d,e,f=g.__localeData__;for(b=0,c=a.length;c>b;b+=1)for(d=a[b].toLowerCase().split("-");d.length;){if(e=f[d.join("-")])return e.locale;d.pop()}var h=a.pop();throw new Error("No locale data has been added to IntlMessageFormat for: "+a.join(", ")+", or the default locale: "+h)};var w={locale:"en",pluralRuleFunction:function(a,b){var c=String(a).split("."),d=!c[1],e=Number(c[0])==a,f=e&&c[0].slice(-1),g=e&&c[0].slice(-2);return b?1==f&&11!=g?"one":2==f&&12!=g?"two":3==f&&13!=g?"few":"other":1==a&&d?"one":"other"}};v.__addLocaleData(w),v.defaultLocale="en";var x=v,y=Math.round,z=function(a,b){a=+a,b=+b;var c=y(b-a),d=y(c/1e3),e=y(d/60),f=y(e/60),g=y(f/24),i=y(g/7),j=h(g),k=y(12*j),l=y(j);return{millisecond:c,second:d,minute:e,hour:f,day:g,week:i,month:k,year:l}},A=Object.prototype.hasOwnProperty,B=Object.prototype.toString,C=function(){try{return!!Object.defineProperty({},"a",{})}catch(a){return!1}}(),D=(!C&&!Object.prototype.__defineGetter__,C?Object.defineProperty:function(a,b,c){"get"in c&&a.__defineGetter__?a.__defineGetter__(b,c.get):(!A.call(a,b)||"value"in c)&&(a[b]=c.value)}),E=Object.create||function(a,b){function c(){}var d,e;c.prototype=a,d=new c;for(e in b)A.call(b,e)&&D(d,e,b[e]);return d},F=Array.prototype.indexOf||function(a,b){var c=this;if(!c.length)return-1;for(var d=b||0,e=c.length;e>d;d++)if(c[d]===a)return d;return-1},G=Array.isArray||function(a){return"[object Array]"===B.call(a)},H=Date.now||function(){return(new Date).getTime()},I=i,J=["second","minute","hour","day","month","year"],K=["best fit","numeric"];D(i,"__localeData__",{value:E(null)}),D(i,"__addLocaleData",{value:function(a){if(!a||!a.locale)throw new Error("Locale data provided to IntlRelativeFormat is missing a `locale` property value");i.__localeData__[a.locale.toLowerCase()]=a,x.__addLocaleData(a)}}),D(i,"defaultLocale",{enumerable:!0,writable:!0,value:void 0}),D(i,"thresholds",{enumerable:!0,value:{second:45,minute:45,hour:22,day:26,month:11}}),i.prototype.resolvedOptions=function(){return{locale:this._locale,style:this._options.style,units:this._options.units}},i.prototype._compileMessage=function(a){var b,c=this._locales,d=(this._locale,this._fields[a]),e=d.relativeTime,f="",g="";for(b in e.future)e.future.hasOwnProperty(b)&&(f+=" "+b+" {"+e.future[b].replace("{0}","#")+"}");for(b in e.past)e.past.hasOwnProperty(b)&&(g+=" "+b+" {"+e.past[b].replace("{0}","#")+"}");var h="{when, select, future {{0, plural, "+f+"}}past {{0, plural, "+g+"}}}";return new x(h,c)},i.prototype._getMessage=function(a){var b=this._messages;return b[a]||(b[a]=this._compileMessage(a)),b[a]},i.prototype._getRelativeUnits=function(a,b){var c=this._fields[b];return c.relative?c.relative[a]:void 0},i.prototype._findFields=function(a){for(var b=i.__localeData__,c=b[a.toLowerCase()];c;){if(c.fields)return c.fields;c=c.parentLocale&&b[c.parentLocale.toLowerCase()]}throw new Error("Locale data added to IntlRelativeFormat is missing `fields` for :"+a)},i.prototype._format=function(a,b){var c=b&&void 0!==b.now?b.now:H();if(void 0===a&&(a=c),!isFinite(c))throw new RangeError("The `now` option provided to IntlRelativeFormat#format() is not in valid range.");if(!isFinite(a))throw new RangeError("The date value provided to IntlRelativeFormat#format() is not in valid range.");var d=z(c,a),e=this._options.units||this._selectUnits(d),f=d[e];if("numeric"!==this._options.style){var g=this._getRelativeUnits(f,e);if(g)return g}return this._getMessage(e).format({0:Math.abs(f),when:0>f?"past":"future"})},i.prototype._isValidUnits=function(a){if(!a||F.call(J,a)>=0)return!0;if("string"==typeof a){var b=/s$/.test(a)&&a.substr(0,a.length-1);if(b&&F.call(J,b)>=0)throw new Error('"'+a+'" is not a valid IntlRelativeFormat `units` value, did you mean: '+b)}throw new Error('"'+a+'" is not a valid IntlRelativeFormat `units` value, it must be one of: "'+J.join('", "')+'"')},i.prototype._resolveLocale=function(a){"string"==typeof a&&(a=[a]),a=(a||[]).concat(i.defaultLocale);var b,c,d,e,f=i.__localeData__;for(b=0,c=a.length;c>b;b+=1)for(d=a[b].toLowerCase().split("-");d.length;){if(e=f[d.join("-")])return e.locale;d.pop()}var g=a.pop();throw new Error("No locale data has been added to IntlRelativeFormat for: "+a.join(", ")+", or the default locale: "+g)},i.prototype._resolveStyle=function(a){if(!a)return K[0];if(F.call(K,a)>=0)return a;throw new Error('"'+a+'" is not a valid IntlRelativeFormat `style` value, it must be one of: "'+K.join('", "')+'"')},i.prototype._selectUnits=function(a){var b,c,d;for(b=0,c=J.length;c>b&&(d=J[b],!(Math.abs(a[d])<i.thresholds[d]));b+=1);return d};var L={locale:"en",pluralRuleFunction:function(a,b){var c=String(a).split("."),d=!c[1],e=Number(c[0])==a,f=e&&c[0].slice(-1),g=e&&c[0].slice(-2);return b?1==f&&11!=g?"one":2==f&&12!=g?"two":3==f&&13!=g?"few":"other":1==a&&d?"one":"other"},fields:{year:{displayName:"Year",relative:{0:"this year",1:"next year","-1":"last year"},relativeTime:{future:{one:"in {0} year",other:"in {0} years"},past:{one:"{0} year ago",other:"{0} years ago"}}},month:{displayName:"Month",relative:{0:"this month",1:"next month","-1":"last month"},relativeTime:{future:{one:"in {0} month",other:"in {0} months"},past:{one:"{0} month ago",other:"{0} months ago"}}},day:{displayName:"Day",relative:{0:"today",1:"tomorrow","-1":"yesterday"},relativeTime:{future:{one:"in {0} day",other:"in {0} days"},past:{one:"{0} day ago",other:"{0} days ago"}}},hour:{displayName:"Hour",relativeTime:{future:{one:"in {0} hour",other:"in {0} hours"},past:{one:"{0} hour ago",other:"{0} hours ago"}}},minute:{displayName:"Minute",relativeTime:{future:{one:"in {0} minute",other:"in {0} minutes"},past:{one:"{0} minute ago",other:"{0} minutes ago"}}},second:{displayName:"Second",relative:{0:"now"},relativeTime:{future:{one:"in {0} second",other:"in {0} seconds"},past:{one:"{0} second ago",other:"{0} seconds ago"}}}}};I.__addLocaleData(L),I.defaultLocale="en";var M=I,N=Function.prototype.bind||function(a){if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var b=Array.prototype.slice.call(arguments,1),c=this,d=function(){},e=function(){return c.apply(this instanceof d?this:a,b.concat(Array.prototype.slice.call(arguments)))};return this.prototype&&(d.prototype=this.prototype),e.prototype=new d,e},O=Object.prototype.hasOwnProperty,P=function(){try{return!!Object.defineProperty({},"a",{})}catch(a){return!1}}(),Q=(!P&&!Object.prototype.__defineGetter__,P?Object.defineProperty:function(a,b,c){"get"in c&&a.__defineGetter__?a.__defineGetter__(b,c.get):(!O.call(a,b)||"value"in c)&&(a[b]=c.value)}),R=Object.create||function(a,b){function c(){}var d,e;c.prototype=a,d=new c;for(e in b)O.call(b,e)&&Q(d,e,b[e]);return d},S=j,T=S(Intl.NumberFormat),U=S(Intl.DateTimeFormat),V=S(x),W=S(M),X={locale:"en",pluralRuleFunction:function(a,b){var c=String(a).split("."),d=!c[1],e=Number(c[0])==a,f=e&&c[0].slice(-1),g=e&&c[0].slice(-2);return b?1==f&&11!=g?"one":2==f&&12!=g?"two":3==f&&13!=g?"few":"other":1==a&&d?"one":"other"},fields:{year:{displayName:"Year",relative:{0:"this year",1:"next year","-1":"last year"},relativeTime:{future:{one:"in {0} year",other:"in {0} years"},past:{one:"{0} year ago",other:"{0} years ago"}}},month:{displayName:"Month",relative:{0:"this month",1:"next month","-1":"last month"},relativeTime:{future:{one:"in {0} month",other:"in {0} months"},past:{one:"{0} month ago",other:"{0} months ago"}}},day:{displayName:"Day",relative:{0:"today",1:"tomorrow","-1":"yesterday"},relativeTime:{future:{one:"in {0} day",other:"in {0} days"},past:{one:"{0} day ago",other:"{0} days ago"}}},hour:{displayName:"Hour",relativeTime:{future:{one:"in {0} hour",other:"in {0} hours"},past:{one:"{0} hour ago",other:"{0} hours ago"}}},minute:{displayName:"Minute",relativeTime:{future:{one:"in {0} minute",other:"in {0} minutes"},past:{one:"{0} minute ago",other:"{0} minutes ago"}}},second:{displayName:"Second",relative:{0:"now"},relativeTime:{future:{one:"in {0} second",other:"in {0} seconds"},past:{one:"{0} second ago",other:"{0} seconds ago"}}}}};o(X);var Y={registerWith:n,__addLocaleData:o};this.HandlebarsIntl=Y}).call(this);

},{}],10:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Handlebars=e():t.Handlebars=e()}(this,function(){return function(t){function e(s){if(r[s])return r[s].exports;var i=r[s]={exports:{},id:s,loaded:!1};return t[s].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){"use strict";function s(){var t=v();return t.compile=function(e,r){return h.compile(e,r,t)},t.precompile=function(e,r){return h.precompile(e,r,t)},t.AST=c.default,t.Compiler=h.Compiler,t.JavaScriptCompiler=u.default,t.Parser=l.parser,t.parse=l.parse,t}var i=r(1).default;e.__esModule=!0;var n=r(2),a=i(n),o=r(35),c=i(o),l=r(36),h=r(41),p=r(42),u=i(p),f=r(39),d=i(f),m=r(34),g=i(m),v=a.default.create,y=s();y.create=s,g.default(y),y.Visitor=d.default,y.default=y,e.default=y,t.exports=e.default},function(t,e){"use strict";e.default=function(t){return t&&t.__esModule?t:{default:t}},e.__esModule=!0},function(t,e,r){"use strict";function s(){var t=new o.HandlebarsEnvironment;return f.extend(t,o),t.SafeString=l.default,t.Exception=p.default,t.Utils=f,t.escapeExpression=f.escapeExpression,t.VM=m,t.template=function(e){return m.template(e,t)},t}var i=r(3).default,n=r(1).default;e.__esModule=!0;var a=r(4),o=i(a),c=r(21),l=n(c),h=r(6),p=n(h),u=r(5),f=i(u),d=r(22),m=i(d),g=r(34),v=n(g),y=s();y.create=s,v.default(y),y.default=y,e.default=y,t.exports=e.default},function(t,e){"use strict";e.default=function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e.default=t,e},e.__esModule=!0},function(t,e,r){"use strict";function s(t,e,r){this.helpers=t||{},this.partials=e||{},this.decorators=r||{},c.registerDefaultHelpers(this),l.registerDefaultDecorators(this)}var i=r(1).default;e.__esModule=!0,e.HandlebarsEnvironment=s;var n=r(5),a=r(6),o=i(a),c=r(10),l=r(18),h=r(20),p=i(h);e.VERSION="4.0.12",e.COMPILER_REVISION=7;var u={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1",7:">= 4.0.0"};e.REVISION_CHANGES=u;var f="[object Object]";s.prototype={constructor:s,logger:p.default,log:p.default.log,registerHelper:function(t,e){if(n.toString.call(t)===f){if(e)throw new o.default("Arg not supported with multiple helpers");n.extend(this.helpers,t)}else this.helpers[t]=e},unregisterHelper:function(t){delete this.helpers[t]},registerPartial:function(t,e){if(n.toString.call(t)===f)n.extend(this.partials,t);else{if(void 0===e)throw new o.default('Attempting to register a partial called "'+t+'" as undefined');this.partials[t]=e}},unregisterPartial:function(t){delete this.partials[t]},registerDecorator:function(t,e){if(n.toString.call(t)===f){if(e)throw new o.default("Arg not supported with multiple decorators");n.extend(this.decorators,t)}else this.decorators[t]=e},unregisterDecorator:function(t){delete this.decorators[t]}};var d=p.default.log;e.log=d,e.createFrame=n.createFrame,e.logger=p.default},function(t,e){"use strict";function r(t){return h[t]}function s(t){for(var e=1;e<arguments.length;e++)for(var r in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],r)&&(t[r]=arguments[e][r]);return t}function i(t,e){for(var r=0,s=t.length;r<s;r++)if(t[r]===e)return r;return-1}function n(t){if("string"!=typeof t){if(t&&t.toHTML)return t.toHTML();if(null==t)return"";if(!t)return t+"";t=""+t}return u.test(t)?t.replace(p,r):t}function a(t){return!t&&0!==t||!(!m(t)||0!==t.length)}function o(t){var e=s({},t);return e._parent=t,e}function c(t,e){return t.path=e,t}function l(t,e){return(t?t+".":"")+e}e.__esModule=!0,e.extend=s,e.indexOf=i,e.escapeExpression=n,e.isEmpty=a,e.createFrame=o,e.blockParams=c,e.appendContextPath=l;var h={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;","=":"&#x3D;"},p=/[&<>"'`=]/g,u=/[&<>"'`=]/,f=Object.prototype.toString;e.toString=f;var d=function(t){return"function"==typeof t};d(/x/)&&(e.isFunction=d=function(t){return"function"==typeof t&&"[object Function]"===f.call(t)}),e.isFunction=d;var m=Array.isArray||function(t){return!(!t||"object"!=typeof t)&&"[object Array]"===f.call(t)};e.isArray=m},function(t,e,r){"use strict";function s(t,e){var r=e&&e.loc,a=void 0,o=void 0;r&&(a=r.start.line,o=r.start.column,t+=" - "+a+":"+o);for(var c=Error.prototype.constructor.call(this,t),l=0;l<n.length;l++)this[n[l]]=c[n[l]];Error.captureStackTrace&&Error.captureStackTrace(this,s);try{r&&(this.lineNumber=a,i?Object.defineProperty(this,"column",{value:o,enumerable:!0}):this.column=o)}catch(t){}}var i=r(7).default;e.__esModule=!0;var n=["description","fileName","lineNumber","message","name","number","stack"];s.prototype=new Error,e.default=s,t.exports=e.default},function(t,e,r){t.exports={default:r(8),__esModule:!0}},function(t,e,r){var s=r(9);t.exports=function(t,e,r){return s.setDesc(t,e,r)}},function(t,e){var r=Object;t.exports={create:r.create,getProto:r.getPrototypeOf,isEnum:{}.propertyIsEnumerable,getDesc:r.getOwnPropertyDescriptor,setDesc:r.defineProperty,setDescs:r.defineProperties,getKeys:r.keys,getNames:r.getOwnPropertyNames,getSymbols:r.getOwnPropertySymbols,each:[].forEach}},function(t,e,r){"use strict";function s(t){a.default(t),c.default(t),h.default(t),u.default(t),d.default(t),g.default(t),y.default(t)}var i=r(1).default;e.__esModule=!0,e.registerDefaultHelpers=s;var n=r(11),a=i(n),o=r(12),c=i(o),l=r(13),h=i(l),p=r(14),u=i(p),f=r(15),d=i(f),m=r(16),g=i(m),v=r(17),y=i(v)},function(t,e,r){"use strict";e.__esModule=!0;var s=r(5);e.default=function(t){t.registerHelper("blockHelperMissing",function(e,r){var i=r.inverse,n=r.fn;if(!0===e)return n(this);if(!1===e||null==e)return i(this);if(s.isArray(e))return e.length>0?(r.ids&&(r.ids=[r.name]),t.helpers.each(e,r)):i(this);if(r.data&&r.ids){var a=s.createFrame(r.data);a.contextPath=s.appendContextPath(r.data.contextPath,r.name),r={data:a}}return n(e,r)})},t.exports=e.default},function(t,e,r){"use strict";var s=r(1).default;e.__esModule=!0;var i=r(5),n=r(6),a=s(n);e.default=function(t){t.registerHelper("each",function(t,e){function r(e,r,n){l&&(l.key=e,l.index=r,l.first=0===r,l.last=!!n,h&&(l.contextPath=h+e)),c+=s(t[e],{data:l,blockParams:i.blockParams([t[e],e],[h+e,null])})}if(!e)throw new a.default("Must pass iterator to #each");var s=e.fn,n=e.inverse,o=0,c="",l=void 0,h=void 0;if(e.data&&e.ids&&(h=i.appendContextPath(e.data.contextPath,e.ids[0])+"."),i.isFunction(t)&&(t=t.call(this)),e.data&&(l=i.createFrame(e.data)),t&&"object"==typeof t)if(i.isArray(t))for(var p=t.length;o<p;o++)o in t&&r(o,o,o===t.length-1);else{var u=void 0;for(var f in t)t.hasOwnProperty(f)&&(void 0!==u&&r(u,o-1),u=f,o++);void 0!==u&&r(u,o-1,!0)}return 0===o&&(c=n(this)),c})},t.exports=e.default},function(t,e,r){"use strict";var s=r(1).default;e.__esModule=!0;var i=r(6),n=s(i);e.default=function(t){t.registerHelper("helperMissing",function(){if(1!==arguments.length)throw new n.default('Missing helper: "'+arguments[arguments.length-1].name+'"')})},t.exports=e.default},function(t,e,r){"use strict";e.__esModule=!0;var s=r(5);e.default=function(t){t.registerHelper("if",function(t,e){return s.isFunction(t)&&(t=t.call(this)),!e.hash.includeZero&&!t||s.isEmpty(t)?e.inverse(this):e.fn(this)}),t.registerHelper("unless",function(e,r){return t.helpers.if.call(this,e,{fn:r.inverse,inverse:r.fn,hash:r.hash})})},t.exports=e.default},function(t,e){"use strict";e.__esModule=!0,e.default=function(t){t.registerHelper("log",function(){for(var e=[void 0],r=arguments[arguments.length-1],s=0;s<arguments.length-1;s++)e.push(arguments[s]);var i=1;null!=r.hash.level?i=r.hash.level:r.data&&null!=r.data.level&&(i=r.data.level),e[0]=i,t.log.apply(t,e)})},t.exports=e.default},function(t,e){"use strict";e.__esModule=!0,e.default=function(t){t.registerHelper("lookup",function(t,e){return t&&t[e]})},t.exports=e.default},function(t,e,r){"use strict";e.__esModule=!0;var s=r(5);e.default=function(t){t.registerHelper("with",function(t,e){s.isFunction(t)&&(t=t.call(this));var r=e.fn;if(s.isEmpty(t))return e.inverse(this);var i=e.data;return e.data&&e.ids&&(i=s.createFrame(e.data),i.contextPath=s.appendContextPath(e.data.contextPath,e.ids[0])),r(t,{data:i,blockParams:s.blockParams([t],[i&&i.contextPath])})})},t.exports=e.default},function(t,e,r){"use strict";function s(t){a.default(t)}var i=r(1).default;e.__esModule=!0,e.registerDefaultDecorators=s;var n=r(19),a=i(n)},function(t,e,r){"use strict";e.__esModule=!0;var s=r(5);e.default=function(t){t.registerDecorator("inline",function(t,e,r,i){var n=t;return e.partials||(e.partials={},n=function(i,n){var a=r.partials;r.partials=s.extend({},a,e.partials);var o=t(i,n);return r.partials=a,o}),e.partials[i.args[0]]=i.fn,n})},t.exports=e.default},function(t,e,r){"use strict";e.__esModule=!0;var s=r(5),i={methodMap:["debug","info","warn","error"],level:"info",lookupLevel:function(t){if("string"==typeof t){var e=s.indexOf(i.methodMap,t.toLowerCase());t=e>=0?e:parseInt(t,10)}return t},log:function(t){if(t=i.lookupLevel(t),"undefined"!=typeof console&&i.lookupLevel(i.level)<=t){var e=i.methodMap[t];console[e]||(e="log");for(var r=arguments.length,s=Array(r>1?r-1:0),n=1;n<r;n++)s[n-1]=arguments[n];console[e].apply(console,s)}}};e.default=i,t.exports=e.default},function(t,e){"use strict";function r(t){this.string=t}e.__esModule=!0,r.prototype.toString=r.prototype.toHTML=function(){return""+this.string},e.default=r,t.exports=e.default},function(t,e,r){"use strict";function s(t){var e=t&&t[0]||1,r=y.COMPILER_REVISION;if(e!==r){if(e<r){var s=y.REVISION_CHANGES[r],i=y.REVISION_CHANGES[e];throw new v.default("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+s+") or downgrade your runtime to an older version ("+i+").")}throw new v.default("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+t[1]+").")}}function i(t,e){function r(r,s,i){i.hash&&(s=m.extend({},s,i.hash),i.ids&&(i.ids[0]=!0)),r=e.VM.resolvePartial.call(this,r,s,i);var n=e.VM.invokePartial.call(this,r,s,i);if(null==n&&e.compile&&(i.partials[i.name]=e.compile(r,t.compilerOptions,e),n=i.partials[i.name](s,i)),null!=n){if(i.indent){for(var a=n.split("\n"),o=0,c=a.length;o<c&&(a[o]||o+1!==c);o++)a[o]=i.indent+a[o];n=a.join("\n")}return n}throw new v.default("The partial "+i.name+" could not be compiled when running in runtime-only mode")}function s(e){function r(e){return""+t.main(i,e,i.helpers,i.partials,a,c,o)}var n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],a=n.data;s._setup(n),!n.partial&&t.useData&&(a=l(e,a));var o=void 0,c=t.useBlockParams?[]:void 0;return t.useDepths&&(o=n.depths?e!=n.depths[0]?[e].concat(n.depths):n.depths:[e]),(r=h(t.main,r,i,n.depths||[],a,c))(e,n)}if(!e)throw new v.default("No environment passed to template");if(!t||!t.main)throw new v.default("Unknown template object: "+typeof t);t.main.decorator=t.main_d,e.VM.checkRevision(t.compiler);var i={strict:function(t,e){if(!(e in t))throw new v.default('"'+e+'" not defined in '+t);return t[e]},lookup:function(t,e){for(var r=t.length,s=0;s<r;s++)if(t[s]&&null!=t[s][e])return t[s][e]},lambda:function(t,e){return"function"==typeof t?t.call(e):t},escapeExpression:m.escapeExpression,invokePartial:r,fn:function(e){var r=t[e];return r.decorator=t[e+"_d"],r},programs:[],program:function(t,e,r,s,i){var a=this.programs[t],o=this.fn(t);return e||i||s||r?a=n(this,t,o,e,r,s,i):a||(a=this.programs[t]=n(this,t,o)),a},data:function(t,e){for(;t&&e--;)t=t._parent;return t},merge:function(t,e){var r=t||e;return t&&e&&t!==e&&(r=m.extend({},e,t)),r},nullContext:p({}),noop:e.VM.noop,compilerInfo:t.compiler};return s.isTop=!0,s._setup=function(r){r.partial?(i.helpers=r.helpers,i.partials=r.partials,i.decorators=r.decorators):(i.helpers=i.merge(r.helpers,e.helpers),t.usePartial&&(i.partials=i.merge(r.partials,e.partials)),(t.usePartial||t.useDecorators)&&(i.decorators=i.merge(r.decorators,e.decorators)))},s._child=function(e,r,s,a){if(t.useBlockParams&&!s)throw new v.default("must pass block params");if(t.useDepths&&!a)throw new v.default("must pass parent depths");return n(i,e,t[e],r,0,s,a)},s}function n(t,e,r,s,i,n,a){function o(e){var i=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],o=a;return!a||e==a[0]||e===t.nullContext&&null===a[0]||(o=[e].concat(a)),r(t,e,t.helpers,t.partials,i.data||s,n&&[i.blockParams].concat(n),o)}return o=h(r,o,t,a,s,n),o.program=e,o.depth=a?a.length:0,o.blockParams=i||0,o}function a(t,e,r){return t?t.call||r.name||(r.name=t,t=r.partials[t]):t="@partial-block"===r.name?r.data["partial-block"]:r.partials[r.name],t}function o(t,e,r){var s=r.data&&r.data["partial-block"];r.partial=!0,r.ids&&(r.data.contextPath=r.ids[0]||r.data.contextPath);var i=void 0;if(r.fn&&r.fn!==c&&function(){r.data=y.createFrame(r.data);var t=r.fn;i=r.data["partial-block"]=function(e){var r=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];return r.data=y.createFrame(r.data),r.data["partial-block"]=s,t(e,r)},t.partials&&(r.partials=m.extend({},r.partials,t.partials))}(),void 0===t&&i&&(t=i),void 0===t)throw new v.default("The partial "+r.name+" could not be found");if(t instanceof Function)return t(e,r)}function c(){return""}function l(t,e){return e&&"root"in e||(e=e?y.createFrame(e):{},e.root=t),e}function h(t,e,r,s,i,n){if(t.decorator){var a={};e=t.decorator(e,a,r,s&&s[0],i,n,s),m.extend(e,a)}return e}var p=r(23).default,u=r(3).default,f=r(1).default;e.__esModule=!0,e.checkRevision=s,e.template=i,e.wrapProgram=n,e.resolvePartial=a,e.invokePartial=o,e.noop=c;var d=r(5),m=u(d),g=r(6),v=f(g),y=r(4)},function(t,e,r){t.exports={default:r(24),__esModule:!0}},function(t,e,r){r(25),t.exports=r(30).Object.seal},function(t,e,r){var s=r(26);r(27)("seal",function(t){return function(e){return t&&s(e)?t(e):e}})},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,r){var s=r(28),i=r(30),n=r(33);t.exports=function(t,e){var r=(i.Object||{})[t]||Object[t],a={};a[t]=e(r),s(s.S+s.F*n(function(){r(1)}),"Object",a)}},function(t,e,r){var s=r(29),i=r(30),n=r(31),a="prototype",o=function(t,e,r){var c,l,h,p=t&o.F,u=t&o.G,f=t&o.S,d=t&o.P,m=t&o.B,g=t&o.W,v=u?i:i[e]||(i[e]={}),y=u?s:f?s[e]:(s[e]||{})[a];u&&(r=e);for(c in r)(l=!p&&y&&c in y)&&c in v||(h=l?y[c]:r[c],v[c]=u&&"function"!=typeof y[c]?r[c]:m&&l?n(h,s):g&&y[c]==h?function(t){var e=function(e){return this instanceof t?new t(e):t(e)};return e[a]=t[a],e}(h):d&&"function"==typeof h?n(Function.call,h):h,d&&((v[a]||(v[a]={}))[c]=h))};o.F=1,o.G=2,o.S=4,o.P=8,o.B=16,o.W=32,t.exports=o},function(t,e){var r=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(t,e){var r=t.exports={version:"1.2.6"};"number"==typeof __e&&(__e=r)},function(t,e,r){var s=r(32);t.exports=function(t,e,r){if(s(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,s){return t.call(e,r,s)};case 3:return function(r,s,i){return t.call(e,r,s,i)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e){(function(r){"use strict";e.__esModule=!0,e.default=function(t){var e=void 0!==r?r:window,s=e.Handlebars;t.noConflict=function(){return e.Handlebars===t&&(e.Handlebars=s),t}},t.exports=e.default}).call(e,function(){return this}())},function(t,e){"use strict";e.__esModule=!0;var r={helpers:{helperExpression:function(t){return"SubExpression"===t.type||("MustacheStatement"===t.type||"BlockStatement"===t.type)&&!!(t.params&&t.params.length||t.hash)},scopedId:function(t){return/^\.|this\b/.test(t.original)},simpleId:function(t){return 1===t.parts.length&&!r.helpers.scopedId(t)&&!t.depth}}};e.default=r,t.exports=e.default},function(t,e,r){"use strict";function s(t,e){return"Program"===t.type?t:(o.default.yy=f,f.locInfo=function(t){return new f.SourceLocation(e&&e.srcName,t)},new l.default(e).accept(o.default.parse(t)))}var i=r(1).default,n=r(3).default;e.__esModule=!0,e.parse=s;var a=r(37),o=i(a),c=r(38),l=i(c),h=r(40),p=n(h),u=r(5);e.parser=o.default;var f={};u.extend(f,p)},function(t,e){"use strict";e.__esModule=!0;var r=function(){function t(){this.yy={}}var e={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,program_repetition0:6,statement:7,mustache:8,block:9,rawBlock:10,partial:11,partialBlock:12,content:13,COMMENT:14,CONTENT:15,openRawBlock:16,rawBlock_repetition_plus0:17,END_RAW_BLOCK:18,OPEN_RAW_BLOCK:19,helperName:20,openRawBlock_repetition0:21,openRawBlock_option0:22,CLOSE_RAW_BLOCK:23,openBlock:24,block_option0:25,closeBlock:26,openInverse:27,block_option1:28,OPEN_BLOCK:29,openBlock_repetition0:30,openBlock_option0:31,openBlock_option1:32,CLOSE:33,OPEN_INVERSE:34,openInverse_repetition0:35,openInverse_option0:36,openInverse_option1:37,openInverseChain:38,OPEN_INVERSE_CHAIN:39,openInverseChain_repetition0:40,openInverseChain_option0:41,openInverseChain_option1:42,inverseAndProgram:43,INVERSE:44,inverseChain:45,inverseChain_option0:46,OPEN_ENDBLOCK:47,OPEN:48,mustache_repetition0:49,mustache_option0:50,OPEN_UNESCAPED:51,mustache_repetition1:52,mustache_option1:53,CLOSE_UNESCAPED:54,OPEN_PARTIAL:55,partialName:56,partial_repetition0:57,partial_option0:58,openPartialBlock:59,OPEN_PARTIAL_BLOCK:60,openPartialBlock_repetition0:61,openPartialBlock_option0:62,param:63,sexpr:64,OPEN_SEXPR:65,sexpr_repetition0:66,sexpr_option0:67,CLOSE_SEXPR:68,hash:69,hash_repetition_plus0:70,hashSegment:71,ID:72,EQUALS:73,blockParams:74,OPEN_BLOCK_PARAMS:75,blockParams_repetition_plus0:76,CLOSE_BLOCK_PARAMS:77,path:78,dataName:79,STRING:80,NUMBER:81,BOOLEAN:82,UNDEFINED:83,NULL:84,DATA:85,pathSegments:86,SEP:87,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"COMMENT",15:"CONTENT",18:"END_RAW_BLOCK",19:"OPEN_RAW_BLOCK",23:"CLOSE_RAW_BLOCK",29:"OPEN_BLOCK",33:"CLOSE",34:"OPEN_INVERSE",39:"OPEN_INVERSE_CHAIN",44:"INVERSE",47:"OPEN_ENDBLOCK",48:"OPEN",51:"OPEN_UNESCAPED",54:"CLOSE_UNESCAPED",55:"OPEN_PARTIAL",60:"OPEN_PARTIAL_BLOCK",65:"OPEN_SEXPR",68:"CLOSE_SEXPR",72:"ID",73:"EQUALS",75:"OPEN_BLOCK_PARAMS",77:"CLOSE_BLOCK_PARAMS",80:"STRING",81:"NUMBER",82:"BOOLEAN",83:"UNDEFINED",84:"NULL",85:"DATA",87:"SEP"},productions_:[0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[13,1],[10,3],[16,5],[9,4],[9,4],[24,6],[27,6],[38,6],[43,2],[45,3],[45,1],[26,3],[8,5],[8,5],[11,5],[12,3],[59,5],[63,1],[63,1],[64,5],[69,1],[71,3],[74,3],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[20,1],[56,1],[56,1],[79,2],[78,1],[86,3],[86,1],[6,0],[6,2],[17,1],[17,2],[21,0],[21,2],[22,0],[22,1],[25,0],[25,1],[28,0],[28,1],[30,0],[30,2],[31,0],[31,1],[32,0],[32,1],[35,0],[35,2],[36,0],[36,1],[37,0],[37,1],[40,0],[40,2],[41,0],[41,1],[42,0],[42,1],[46,0],[46,1],[49,0],[49,2],[50,0],[50,1],[52,0],[52,2],[53,0],[53,1],[57,0],[57,2],[58,0],[58,1],[61,0],[61,2],[62,0],[62,1],[66,0],[66,2],[67,0],[67,1],[70,1],[70,2],[76,1],[76,2]],performAction:function(t,e,r,s,i,n,a){var o=n.length-1;switch(i){case 1:return n[o-1];case 2:this.$=s.prepareProgram(n[o]);break;case 3:case 4:case 5:case 6:case 7:case 8:this.$=n[o];break;case 9:this.$={type:"CommentStatement",value:s.stripComment(n[o]),strip:s.stripFlags(n[o],n[o]),loc:s.locInfo(this._$)};break;case 10:this.$={type:"ContentStatement",original:n[o],value:n[o],loc:s.locInfo(this._$)};break;case 11:this.$=s.prepareRawBlock(n[o-2],n[o-1],n[o],this._$);break;case 12:this.$={path:n[o-3],params:n[o-2],hash:n[o-1]};break;case 13:this.$=s.prepareBlock(n[o-3],n[o-2],n[o-1],n[o],!1,this._$);break;case 14:this.$=s.prepareBlock(n[o-3],n[o-2],n[o-1],n[o],!0,this._$);break;case 15:this.$={open:n[o-5],path:n[o-4],params:n[o-3],hash:n[o-2],blockParams:n[o-1],strip:s.stripFlags(n[o-5],n[o])};break;case 16:case 17:this.$={path:n[o-4],params:n[o-3],hash:n[o-2],blockParams:n[o-1],strip:s.stripFlags(n[o-5],n[o])};break;case 18:this.$={strip:s.stripFlags(n[o-1],n[o-1]),program:n[o]};break;case 19:var c=s.prepareBlock(n[o-2],n[o-1],n[o],n[o],!1,this._$),l=s.prepareProgram([c],n[o-1].loc);l.chained=!0,this.$={strip:n[o-2].strip,program:l,chain:!0};break;case 20:this.$=n[o];break;case 21:this.$={path:n[o-1],strip:s.stripFlags(n[o-2],n[o])};break;case 22:case 23:this.$=s.prepareMustache(n[o-3],n[o-2],n[o-1],n[o-4],s.stripFlags(n[o-4],n[o]),this._$);break;case 24:this.$={type:"PartialStatement",name:n[o-3],params:n[o-2],hash:n[o-1],indent:"",strip:s.stripFlags(n[o-4],n[o]),loc:s.locInfo(this._$)};break;case 25:this.$=s.preparePartialBlock(n[o-2],n[o-1],n[o],this._$);break;case 26:this.$={path:n[o-3],params:n[o-2],hash:n[o-1],strip:s.stripFlags(n[o-4],n[o])};break;case 27:case 28:this.$=n[o];break;case 29:this.$={type:"SubExpression",path:n[o-3],params:n[o-2],hash:n[o-1],loc:s.locInfo(this._$)};break;case 30:this.$={type:"Hash",pairs:n[o],loc:s.locInfo(this._$)};break;case 31:this.$={type:"HashPair",key:s.id(n[o-2]),value:n[o],loc:s.locInfo(this._$)};break;case 32:this.$=s.id(n[o-1]);break;case 33:case 34:this.$=n[o];break;case 35:this.$={type:"StringLiteral",value:n[o],original:n[o],loc:s.locInfo(this._$)};break;case 36:this.$={type:"NumberLiteral",value:Number(n[o]),original:Number(n[o]),loc:s.locInfo(this._$)};break;case 37:this.$={type:"BooleanLiteral",value:"true"===n[o],original:"true"===n[o],loc:s.locInfo(this._$)};break;case 38:this.$={type:"UndefinedLiteral",original:void 0,value:void 0,loc:s.locInfo(this._$)};break;case 39:this.$={type:"NullLiteral",original:null,value:null,loc:s.locInfo(this._$)};break;case 40:case 41:this.$=n[o];break;case 42:this.$=s.preparePath(!0,n[o],this._$);break;case 43:this.$=s.preparePath(!1,n[o],this._$);break;case 44:n[o-2].push({part:s.id(n[o]),original:n[o],separator:n[o-1]}),this.$=n[o-2];break;case 45:this.$=[{part:s.id(n[o]),original:n[o]}];break;case 46:this.$=[];break;case 47:n[o-1].push(n[o]);break;case 48:this.$=[n[o]];break;case 49:n[o-1].push(n[o]);break;case 50:this.$=[];break;case 51:n[o-1].push(n[o]);break;case 58:this.$=[];break;case 59:n[o-1].push(n[o]);break;case 64:this.$=[];break;case 65:n[o-1].push(n[o]);break;case 70:this.$=[];break;case 71:n[o-1].push(n[o]);break;case 78:this.$=[];break;case 79:n[o-1].push(n[o]);break;case 82:this.$=[];break;case 83:n[o-1].push(n[o]);break;case 86:this.$=[];break;case 87:n[o-1].push(n[o]);break;case 90:this.$=[];break;case 91:n[o-1].push(n[o]);break;case 94:this.$=[];break;case 95:n[o-1].push(n[o]);break;case 98:this.$=[n[o]];break;case 99:n[o-1].push(n[o]);break;case 100:this.$=[n[o]];break;case 101:n[o-1].push(n[o])}},table:[{3:1,4:2,5:[2,46],6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:10,13:11,14:[1,12],15:[1,20],16:17,19:[1,23],24:15,27:16,29:[1,21],34:[1,22],39:[2,2],44:[2,2],47:[2,2],48:[1,13],51:[1,14],55:[1,18],59:19,60:[1,24]},{1:[2,1]},{5:[2,47],14:[2,47],15:[2,47],19:[2,47],29:[2,47],34:[2,47],39:[2,47],44:[2,47],47:[2,47],48:[2,47],51:[2,47],55:[2,47],60:[2,47]},{5:[2,3],14:[2,3],15:[2,3],19:[2,3],29:[2,3],34:[2,3],39:[2,3],44:[2,3],47:[2,3],48:[2,3],51:[2,3],55:[2,3],60:[2,3]},{5:[2,4],14:[2,4],15:[2,4],19:[2,4],29:[2,4],34:[2,4],39:[2,4],44:[2,4],47:[2,4],48:[2,4],51:[2,4],55:[2,4],60:[2,4]},{5:[2,5],14:[2,5],15:[2,5],19:[2,5],29:[2,5],34:[2,5],39:[2,5],44:[2,5],47:[2,5],48:[2,5],51:[2,5],55:[2,5],60:[2,5]},{5:[2,6],14:[2,6],15:[2,6],19:[2,6],29:[2,6],34:[2,6],39:[2,6],44:[2,6],47:[2,6],48:[2,6],51:[2,6],55:[2,6],60:[2,6]},{5:[2,7],14:[2,7],15:[2,7],19:[2,7],29:[2,7],34:[2,7],39:[2,7],44:[2,7],47:[2,7],48:[2,7],51:[2,7],55:[2,7],60:[2,7]},{5:[2,8],14:[2,8],15:[2,8],19:[2,8],29:[2,8],34:[2,8],39:[2,8],44:[2,8],47:[2,8],48:[2,8],51:[2,8],55:[2,8],60:[2,8]},{5:[2,9],14:[2,9],15:[2,9],19:[2,9],29:[2,9],34:[2,9],39:[2,9],44:[2,9],47:[2,9],48:[2,9],51:[2,9],55:[2,9],60:[2,9]},{20:25,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:36,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:37,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{4:38,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{13:40,15:[1,20],17:39},{20:42,56:41,64:43,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:45,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{5:[2,10],14:[2,10],15:[2,10],18:[2,10],19:[2,10],29:[2,10],34:[2,10],39:[2,10],44:[2,10],47:[2,10],48:[2,10],51:[2,10],55:[2,10],60:[2,10]},{20:46,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:47,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:48,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:42,56:49,64:43,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[2,78],49:50,65:[2,78],72:[2,78],80:[2,78],81:[2,78],82:[2,78],83:[2,78],84:[2,78],85:[2,78]},{23:[2,33],33:[2,33],54:[2,33],65:[2,33],68:[2,33],72:[2,33],75:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33]},{23:[2,34],33:[2,34],54:[2,34],65:[2,34],68:[2,34],72:[2,34],75:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34]},{23:[2,35],33:[2,35],54:[2,35],65:[2,35],68:[2,35],72:[2,35],75:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35]},{23:[2,36],33:[2,36],54:[2,36],65:[2,36],68:[2,36],72:[2,36],75:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36]},{23:[2,37],33:[2,37],54:[2,37],65:[2,37],68:[2,37],72:[2,37],75:[2,37],80:[2,37],81:[2,37],82:[2,37],83:[2,37],84:[2,37],85:[2,37]},{23:[2,38],33:[2,38],54:[2,38],65:[2,38],68:[2,38],72:[2,38],75:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38]},{23:[2,39],33:[2,39],54:[2,39],65:[2,39],68:[2,39],72:[2,39],75:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39]},{23:[2,43],33:[2,43],54:[2,43],65:[2,43],68:[2,43],72:[2,43],75:[2,43],80:[2,43],81:[2,43],82:[2,43],83:[2,43],84:[2,43],85:[2,43],87:[1,51]},{72:[1,35],86:52},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{52:53,54:[2,82],65:[2,82],72:[2,82],80:[2,82],81:[2,82],82:[2,82],83:[2,82],84:[2,82],85:[2,82]},{25:54,38:56,39:[1,58],43:57,44:[1,59],45:55,47:[2,54]},{28:60,43:61,44:[1,59],47:[2,56]},{13:63,15:[1,20],18:[1,62]},{15:[2,48],18:[2,48]},{33:[2,86],57:64,65:[2,86],72:[2,86],80:[2,86],81:[2,86],82:[2,86],83:[2,86],84:[2,86],85:[2,86]},{33:[2,40],65:[2,40],72:[2,40],80:[2,40],81:[2,40],82:[2,40],83:[2,40],84:[2,40],85:[2,40]},{33:[2,41],65:[2,41],72:[2,41],80:[2,41],81:[2,41],82:[2,41],83:[2,41],84:[2,41],85:[2,41]},{20:65,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:66,47:[1,67]},{30:68,33:[2,58],65:[2,58],72:[2,58],75:[2,58],80:[2,58],81:[2,58],82:[2,58],83:[2,58],84:[2,58],85:[2,58]},{33:[2,64],35:69,65:[2,64],72:[2,64],75:[2,64],80:[2,64],81:[2,64],82:[2,64],83:[2,64],84:[2,64],85:[2,64]},{21:70,23:[2,50],65:[2,50],72:[2,50],80:[2,50],81:[2,50],82:[2,50],83:[2,50],84:[2,50],85:[2,50]},{33:[2,90],61:71,65:[2,90],72:[2,90],80:[2,90],81:[2,90],82:[2,90],83:[2,90],84:[2,90],85:[2,90]},{20:75,33:[2,80],50:72,63:73,64:76,65:[1,44],69:74,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{72:[1,80]},{23:[2,42],33:[2,42],54:[2,42],65:[2,42],68:[2,42],72:[2,42],75:[2,42],80:[2,42],81:[2,42],82:[2,42],83:[2,42],84:[2,42],85:[2,42],87:[1,51]},{20:75,53:81,54:[2,84],63:82,64:76,65:[1,44],69:83,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{26:84,47:[1,67]},{47:[2,55]},{4:85,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],39:[2,46],44:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{47:[2,20]},{20:86,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{4:87,6:3,14:[2,46],15:[2,46],19:[2,46],29:[2,46],34:[2,46],47:[2,46],48:[2,46],51:[2,46],55:[2,46],60:[2,46]},{26:88,47:[1,67]},{47:[2,57]},{5:[2,11],14:[2,11],15:[2,11],19:[2,11],29:[2,11],34:[2,11],39:[2,11],44:[2,11],47:[2,11],48:[2,11],51:[2,11],55:[2,11],60:[2,11]},{15:[2,49],18:[2,49]},{20:75,33:[2,88],58:89,63:90,64:76,65:[1,44],69:91,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{65:[2,94],66:92,68:[2,94],72:[2,94],80:[2,94],81:[2,94],82:[2,94],83:[2,94],84:[2,94],85:[2,94]},{5:[2,25],14:[2,25],15:[2,25],19:[2,25],29:[2,25],34:[2,25],39:[2,25],44:[2,25],47:[2,25],48:[2,25],51:[2,25],55:[2,25],60:[2,25]},{20:93,72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,31:94,33:[2,60],63:95,64:76,65:[1,44],69:96,70:77,71:78,72:[1,79],75:[2,60],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,33:[2,66],36:97,63:98,64:76,65:[1,44],69:99,70:77,71:78,72:[1,79],75:[2,66],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,22:100,23:[2,52],63:101,64:76,65:[1,44],69:102,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{20:75,33:[2,92],62:103,63:104,64:76,65:[1,44],69:105,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,106]},{33:[2,79],65:[2,79],72:[2,79],80:[2,79],81:[2,79],82:[2,79],83:[2,79],84:[2,79],85:[2,79]},{33:[2,81]},{23:[2,27],33:[2,27],54:[2,27],65:[2,27],68:[2,27],72:[2,27],75:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27]},{23:[2,28],33:[2,28],54:[2,28],65:[2,28],68:[2,28],72:[2,28],75:[2,28],80:[2,28],81:[2,28],82:[2,28],83:[2,28],84:[2,28],85:[2,28]},{23:[2,30],33:[2,30],54:[2,30],68:[2,30],71:107,72:[1,108],75:[2,30]},{23:[2,98],33:[2,98],54:[2,98],68:[2,98],72:[2,98],75:[2,98]},{23:[2,45],33:[2,45],54:[2,45],65:[2,45],68:[2,45],72:[2,45],73:[1,109],75:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],87:[2,45]},{23:[2,44],33:[2,44],54:[2,44],65:[2,44],68:[2,44],72:[2,44],75:[2,44],80:[2,44],81:[2,44],82:[2,44],83:[2,44],84:[2,44],85:[2,44],87:[2,44]},{54:[1,110]},{54:[2,83],65:[2,83],72:[2,83],80:[2,83],81:[2,83],82:[2,83],83:[2,83],84:[2,83],85:[2,83]},{54:[2,85]},{5:[2,13],14:[2,13],15:[2,13],19:[2,13],29:[2,13],34:[2,13],39:[2,13],44:[2,13],47:[2,13],48:[2,13],51:[2,13],55:[2,13],60:[2,13]},{38:56,39:[1,58],43:57,44:[1,59],45:112,46:111,47:[2,76]},{33:[2,70],40:113,65:[2,70],72:[2,70],75:[2,70],80:[2,70],81:[2,70],82:[2,70],83:[2,70],84:[2,70],85:[2,70]},{47:[2,18]},{5:[2,14],14:[2,14],15:[2,14],19:[2,14],29:[2,14],34:[2,14],39:[2,14],44:[2,14],47:[2,14],48:[2,14],51:[2,14],55:[2,14],60:[2,14]},{33:[1,114]},{33:[2,87],65:[2,87],72:[2,87],80:[2,87],81:[2,87],82:[2,87],83:[2,87],84:[2,87],85:[2,87]},{33:[2,89]},{20:75,63:116,64:76,65:[1,44],67:115,68:[2,96],69:117,70:77,71:78,72:[1,79],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{33:[1,118]},{32:119,33:[2,62],74:120,75:[1,121]},{33:[2,59],65:[2,59],72:[2,59],75:[2,59],80:[2,59],81:[2,59],82:[2,59],83:[2,59],84:[2,59],85:[2,59]},{33:[2,61],75:[2,61]},{33:[2,68],37:122,74:123,75:[1,121]},{33:[2,65],65:[2,65],72:[2,65],75:[2,65],80:[2,65],81:[2,65],82:[2,65],83:[2,65],84:[2,65],85:[2,65]},{33:[2,67],75:[2,67]},{23:[1,124]},{23:[2,51],65:[2,51],72:[2,51],80:[2,51],81:[2,51],82:[2,51],83:[2,51],84:[2,51],85:[2,51]},{23:[2,53]},{33:[1,125]},{33:[2,91],65:[2,91],72:[2,91],80:[2,91],81:[2,91],82:[2,91],83:[2,91],84:[2,91],85:[2,91]},{33:[2,93]},{5:[2,22],14:[2,22],15:[2,22],19:[2,22],29:[2,22],34:[2,22],39:[2,22],44:[2,22],47:[2,22],48:[2,22],51:[2,22],55:[2,22],60:[2,22]},{23:[2,99],33:[2,99],54:[2,99],68:[2,99],72:[2,99],75:[2,99]},{73:[1,109]},{20:75,63:126,64:76,65:[1,44],72:[1,35],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,23],14:[2,23],15:[2,23],19:[2,23],29:[2,23],34:[2,23],39:[2,23],44:[2,23],47:[2,23],48:[2,23],51:[2,23],55:[2,23],60:[2,23]},{47:[2,19]},{47:[2,77]},{20:75,33:[2,72],41:127,63:128,64:76,65:[1,44],69:129,70:77,71:78,72:[1,79],75:[2,72],78:26,79:27,80:[1,28],81:[1,29],82:[1,30],83:[1,31],84:[1,32],85:[1,34],86:33},{5:[2,24],14:[2,24],15:[2,24],19:[2,24],29:[2,24],34:[2,24],39:[2,24],44:[2,24],47:[2,24],48:[2,24],51:[2,24],55:[2,24],60:[2,24]},{68:[1,130]},{65:[2,95],68:[2,95],72:[2,95],80:[2,95],81:[2,95],82:[2,95],83:[2,95],84:[2,95],85:[2,95]},{68:[2,97]},{5:[2,21],14:[2,21],15:[2,21],19:[2,21],29:[2,21],34:[2,21],39:[2,21],44:[2,21],47:[2,21],48:[2,21],51:[2,21],55:[2,21],60:[2,21]},{33:[1,131]},{33:[2,63]},{72:[1,133],76:132},{33:[1,134]},{33:[2,69]},{15:[2,12]},{14:[2,26],15:[2,26],19:[2,26],29:[2,26],34:[2,26],47:[2,26],48:[2,26],51:[2,26],55:[2,26],60:[2,26]},{23:[2,31],33:[2,31],54:[2,31],68:[2,31],72:[2,31],75:[2,31]},{33:[2,74],42:135,74:136,75:[1,121]},{33:[2,71],65:[2,71],72:[2,71],75:[2,71],80:[2,71],81:[2,71],82:[2,71],83:[2,71],84:[2,71],85:[2,71]},{33:[2,73],75:[2,73]},{23:[2,29],33:[2,29],54:[2,29],65:[2,29],68:[2,29],72:[2,29],75:[2,29],80:[2,29],81:[2,29],82:[2,29],83:[2,29],84:[2,29],85:[2,29]},{14:[2,15],15:[2,15],19:[2,15],29:[2,15],34:[2,15],39:[2,15],44:[2,15],47:[2,15],48:[2,15],51:[2,15],55:[2,15],60:[2,15]},{72:[1,138],77:[1,137]},{72:[2,100],77:[2,100]},{14:[2,16],15:[2,16],19:[2,16],29:[2,16],34:[2,16],44:[2,16],47:[2,16],48:[2,16],51:[2,16],55:[2,16],60:[2,16]},{33:[1,139]},{33:[2,75]},{33:[2,32]},{72:[2,101],77:[2,101]},{14:[2,17],15:[2,17],19:[2,17],29:[2,17],34:[2,17],39:[2,17],44:[2,17],47:[2,17],48:[2,17],51:[2,17],55:[2,17],60:[2,17]}],defaultActions:{4:[2,1],55:[2,55],57:[2,20],61:[2,57],74:[2,81],83:[2,85],87:[2,18],91:[2,89],102:[2,53],105:[2,93],111:[2,19],112:[2,77],117:[2,97],120:[2,63],123:[2,69],124:[2,12],136:[2,75],137:[2,32]},parseError:function(t,e){throw new Error(t)},parse:function(t){function e(){var t;return t=r.lexer.lex()||1,"number"!=typeof t&&(t=r.symbols_[t]||t),t}var r=this,s=[0],i=[null],n=[],a=this.table,o="",c=0,l=0,h=0;this.lexer.setInput(t),this.lexer.yy=this.yy,this.yy.lexer=this.lexer,this.yy.parser=this,void 0===this.lexer.yylloc&&(this.lexer.yylloc={});var p=this.lexer.yylloc;n.push(p);var u=this.lexer.options&&this.lexer.options.ranges;"function"==typeof this.yy.parseError&&(this.parseError=this.yy.parseError);for(var f,d,m,g,v,y,k,S,b,_={};;){if(m=s[s.length-1],this.defaultActions[m]?g=this.defaultActions[m]:(null!==f&&void 0!==f||(f=e()),g=a[m]&&a[m][f]),void 0===g||!g.length||!g[0]){var P="";if(!h){b=[];for(y in a[m])this.terminals_[y]&&y>2&&b.push("'"+this.terminals_[y]+"'");P=this.lexer.showPosition?"Parse error on line "+(c+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+b.join(", ")+", got '"+(this.terminals_[f]||f)+"'":"Parse error on line "+(c+1)+": Unexpected "+(1==f?"end of input":"'"+(this.terminals_[f]||f)+"'"),this.parseError(P,{text:this.lexer.match,token:this.terminals_[f]||f,line:this.lexer.yylineno,loc:p,expected:b})}}if(g[0]instanceof Array&&g.length>1)throw new Error("Parse Error: multiple actions possible at state: "+m+", token: "+f);switch(g[0]){case 1:s.push(f),i.push(this.lexer.yytext),n.push(this.lexer.yylloc),s.push(g[1]),f=null,d?(f=d,d=null):(l=this.lexer.yyleng,o=this.lexer.yytext,c=this.lexer.yylineno,p=this.lexer.yylloc,h>0&&h--);break;case 2:if(k=this.productions_[g[1]][1],_.$=i[i.length-k],_._$={first_line:n[n.length-(k||1)].first_line,last_line:n[n.length-1].last_line,first_column:n[n.length-(k||1)].first_column,last_column:n[n.length-1].last_column},u&&(_._$.range=[n[n.length-(k||1)].range[0],n[n.length-1].range[1]]),void 0!==(v=this.performAction.call(_,o,l,c,this.yy,g[1],i,n)))return v;k&&(s=s.slice(0,-1*k*2),i=i.slice(0,-1*k),n=n.slice(0,-1*k)),s.push(this.productions_[g[1]][0]),i.push(_.$),n.push(_._$),S=a[s[s.length-2]][s[s.length-1]],s.push(S);break;case 3:return!0}}return!0}},r=function(){var t={EOF:1,parseError:function(t,e){if(!this.yy.parser)throw new Error(t);this.yy.parser.parseError(t,e)},setInput:function(t){return this._input=t,this._more=this._less=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},input:function(){var t=this._input[0];return this.yytext+=t,this.yyleng++,this.offset++,this.match+=t,this.matched+=t,t.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),t},unput:function(t){var e=t.length,r=t.split(/(?:\r\n?|\n)/g);this._input=t+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-e-1),this.offset-=e;var s=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),r.length-1&&(this.yylineno-=r.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:r?(r.length===s.length?this.yylloc.first_column:0)+s[s.length-r.length].length-r[0].length:this.yylloc.first_column-e},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-e]),this},more:function(){return this._more=!0,this},less:function(t){this.unput(this.match.slice(t))},pastInput:function(){var t=this.matched.substr(0,this.matched.length-this.match.length);return(t.length>20?"...":"")+t.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var t=this.match;return t.length<20&&(t+=this._input.substr(0,20-t.length)),(t.substr(0,20)+(t.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var t=this.pastInput(),e=new Array(t.length+1).join("-");return t+this.upcomingInput()+"\n"+e+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var t,e,r,s,i;this._more||(this.yytext="",this.match="");for(var n=this._currentRules(),a=0;a<n.length&&(!(r=this._input.match(this.rules[n[a]]))||e&&!(r[0].length>e[0].length)||(e=r,s=a,this.options.flex));a++);return e?(i=e[0].match(/(?:\r\n?|\n).*/g),i&&(this.yylineno+=i.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:i?i[i.length-1].length-i[i.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],t=this.performAction.call(this,this.yy,this,n[s],this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),t||void 0):""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var t=this.next();return void 0!==t?t:this.lex()},begin:function(t){this.conditionStack.push(t)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(t){this.begin(t)}};return t.options={},t.performAction=function(t,e,r,s){function i(t,r){return e.yytext=e.yytext.substr(t,e.yyleng-r)}switch(r){case 0:if("\\\\"===e.yytext.slice(-2)?(i(0,1),this.begin("mu")):"\\"===e.yytext.slice(-1)?(i(0,1),this.begin("emu")):this.begin("mu"),e.yytext)return 15;break;case 1:return 15;case 2:return this.popState(),15;case 3:return this.begin("raw"),15;case 4:return this.popState(),"raw"===this.conditionStack[this.conditionStack.length-1]?15:(e.yytext=e.yytext.substr(5,e.yyleng-9),"END_RAW_BLOCK");case 5:return 15;case 6:return this.popState(),14;case 7:return 65;case 8:return 68;case 9:return 19;case 10:return this.popState(),this.begin("raw"),23;case 11:return 55;case 12:return 60;case 13:return 29;case 14:return 47;case 15:case 16:return this.popState(),44;case 17:return 34;case 18:return 39;case 19:return 51;case 20:return 48;case 21:this.unput(e.yytext),this.popState(),this.begin("com");break;case 22:return this.popState(),14;case 23:return 48;case 24:return 73;case 25:case 26:return 72;case 27:return 87;case 28:break;case 29:return this.popState(),54;case 30:return this.popState(),33;case 31:return e.yytext=i(1,2).replace(/\\"/g,'"'),80;case 32:return e.yytext=i(1,2).replace(/\\'/g,"'"),80;case 33:return 85;case 34:case 35:return 82;case 36:return 83;case 37:return 84;case 38:return 81;case 39:return 75;case 40:return 77;case 41:return 72;case 42:return e.yytext=e.yytext.replace(/\\([\\\]])/g,"$1"),72;case 43:return"INVALID";case 44:return 5}},t.rules=[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{(?=[^\/]))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]*?(?=(\{\{\{\{)))/,/^(?:[\s\S]*?--(~)?\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#>)/,/^(?:\{\{(~)?#\*?)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{(~)?!--)/,/^(?:\{\{(~)?![\s\S]*?\}\})/,/^(?:\{\{(~)?\*?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)|])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:undefined(?=([~}\s)])))/,/^(?:null(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:as\s+\|)/,/^(?:\|)/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,/^(?:\[(\\\]|[^\]])*\])/,/^(?:.)/,/^(?:$)/],t.conditions={mu:{rules:[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[6],inclusive:!1},raw:{rules:[3,4,5],inclusive:!1},INITIAL:{rules:[0,1,44],inclusive:!0}},t}();return e.lexer=r,t.prototype=e,e.Parser=t,new t}();e.default=r,t.exports=e.default},function(t,e,r){"use strict";function s(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];this.options=t}function i(t,e,r){void 0===e&&(e=t.length);var s=t[e-1],i=t[e-2];return s?"ContentStatement"===s.type?(i||!r?/\r?\n\s*?$/:/(^|\r?\n)\s*?$/).test(s.original):void 0:r}function n(t,e,r){void 0===e&&(e=-1);var s=t[e+1],i=t[e+2];return s?"ContentStatement"===s.type?(i||!r?/^\s*?\r?\n/:/^\s*?(\r?\n|$)/).test(s.original):void 0:r}function a(t,e,r){var s=t[null==e?0:e+1];if(s&&"ContentStatement"===s.type&&(r||!s.rightStripped)){var i=s.value;s.value=s.value.replace(r?/^\s+/:/^[ \t]*\r?\n?/,""),s.rightStripped=s.value!==i}}function o(t,e,r){var s=t[null==e?t.length-1:e-1];if(s&&"ContentStatement"===s.type&&(r||!s.leftStripped)){var i=s.value;return s.value=s.value.replace(r?/\s+$/:/[ \t]+$/,""),s.leftStripped=s.value!==i,s.leftStripped}}var c=r(1).default;e.__esModule=!0;var l=r(39),h=c(l);s.prototype=new h.default,s.prototype.Program=function(t){var e=!this.options.ignoreStandalone,r=!this.isRootSeen;this.isRootSeen=!0;for(var s=t.body,c=0,l=s.length;c<l;c++){var h=s[c],p=this.accept(h);if(p){var u=i(s,c,r),f=n(s,c,r),d=p.openStandalone&&u,m=p.closeStandalone&&f,g=p.inlineStandalone&&u&&f;p.close&&a(s,c,!0),p.open&&o(s,c,!0),e&&g&&(a(s,c),o(s,c)&&"PartialStatement"===h.type&&(h.indent=/([ \t]+$)/.exec(s[c-1].original)[1])),e&&d&&(a((h.program||h.inverse).body),o(s,c)),e&&m&&(a(s,c),o((h.inverse||h.program).body))}}return t},s.prototype.BlockStatement=s.prototype.DecoratorBlock=s.prototype.PartialBlockStatement=function(t){this.accept(t.program),this.accept(t.inverse);var e=t.program||t.inverse,r=t.program&&t.inverse,s=r,c=r;if(r&&r.chained)for(s=r.body[0].program;c.chained;)c=c.body[c.body.length-1].program;var l={open:t.openStrip.open,close:t.closeStrip.close,openStandalone:n(e.body),closeStandalone:i((s||e).body)};if(t.openStrip.close&&a(e.body,null,!0),r){var h=t.inverseStrip;h.open&&o(e.body,null,!0),h.close&&a(s.body,null,!0),t.closeStrip.open&&o(c.body,null,!0),!this.options.ignoreStandalone&&i(e.body)&&n(s.body)&&(o(e.body),a(s.body))}else t.closeStrip.open&&o(e.body,null,!0);return l},s.prototype.Decorator=s.prototype.MustacheStatement=function(t){return t.strip},s.prototype.PartialStatement=s.prototype.CommentStatement=function(t){var e=t.strip||{};return{inlineStandalone:!0,open:e.open,close:e.close}},e.default=s,t.exports=e.default},function(t,e,r){"use strict";function s(){this.parents=[]}function i(t){this.acceptRequired(t,"path"),this.acceptArray(t.params),this.acceptKey(t,"hash")}function n(t){i.call(this,t),this.acceptKey(t,"program"),this.acceptKey(t,"inverse")}function a(t){this.acceptRequired(t,"name"),this.acceptArray(t.params),this.acceptKey(t,"hash")}var o=r(1).default;e.__esModule=!0;var c=r(6),l=o(c);s.prototype={constructor:s,mutating:!1,acceptKey:function(t,e){var r=this.accept(t[e]);if(this.mutating){if(r&&!s.prototype[r.type])throw new l.default('Unexpected node type "'+r.type+'" found when accepting '+e+" on "+t.type);t[e]=r}},acceptRequired:function(t,e){if(this.acceptKey(t,e),!t[e])throw new l.default(t.type+" requires "+e)},acceptArray:function(t){for(var e=0,r=t.length;e<r;e++)this.acceptKey(t,e),t[e]||(t.splice(e,1),e--,r--)},accept:function(t){if(t){if(!this[t.type])throw new l.default("Unknown type: "+t.type,t);this.current&&this.parents.unshift(this.current),this.current=t;var e=this[t.type](t);return this.current=this.parents.shift(),!this.mutating||e?e:!1!==e?t:void 0}},Program:function(t){this.acceptArray(t.body)},MustacheStatement:i,Decorator:i,BlockStatement:n,DecoratorBlock:n,PartialStatement:a,PartialBlockStatement:function(t){a.call(this,t),this.acceptKey(t,"program")},ContentStatement:function(){},CommentStatement:function(){},SubExpression:i,PathExpression:function(){},StringLiteral:function(){},NumberLiteral:function(){},BooleanLiteral:function(){},UndefinedLiteral:function(){},NullLiteral:function(){},Hash:function(t){this.acceptArray(t.pairs)},HashPair:function(t){this.acceptRequired(t,"value")}},e.default=s,t.exports=e.default},function(t,e,r){"use strict";function s(t,e){if(e=e.path?e.path.original:e,t.path.original!==e){var r={loc:t.path.loc};throw new g.default(t.path.original+" doesn't match "+e,r)}}function i(t,e){this.source=t,this.start={line:e.first_line,column:e.first_column},this.end={line:e.last_line,column:e.last_column}}function n(t){return/^\[.*\]$/.test(t)?t.substr(1,t.length-2):t}function a(t,e){return{open:"~"===t.charAt(2),close:"~"===e.charAt(e.length-3)}}function o(t){return t.replace(/^\{\{~?!-?-?/,"").replace(/-?-?~?\}\}$/,"")}function c(t,e,r){r=this.locInfo(r);for(var s=t?"@":"",i=[],n=0,a=0,o=e.length;a<o;a++){var c=e[a].part,l=e[a].original!==c;if(s+=(e[a].separator||"")+c,l||".."!==c&&"."!==c&&"this"!==c)i.push(c);else{if(i.length>0)throw new g.default("Invalid path: "+s,{loc:r});".."===c&&n++}}return{type:"PathExpression",data:t,depth:n,parts:i,original:s,loc:r}}function l(t,e,r,s,i,n){var a=s.charAt(3)||s.charAt(2),o="{"!==a&&"&"!==a;return{type:/\*/.test(s)?"Decorator":"MustacheStatement",path:t,params:e,hash:r,escaped:o,strip:i,loc:this.locInfo(n)}}function h(t,e,r,i){s(t,r),i=this.locInfo(i);var n={type:"Program",body:e,strip:{},loc:i};return{type:"BlockStatement",path:t.path,params:t.params,hash:t.hash,program:n,openStrip:{},inverseStrip:{},closeStrip:{},loc:i}}function p(t,e,r,i,n,a){i&&i.path&&s(t,i);var o=/\*/.test(t.open);e.blockParams=t.blockParams;var c=void 0,l=void 0;if(r){if(o)throw new g.default("Unexpected inverse block on decorator",r);r.chain&&(r.program.body[0].closeStrip=i.strip),l=r.strip,c=r.program}return n&&(n=c,c=e,e=n),{type:o?"DecoratorBlock":"BlockStatement",path:t.path,params:t.params,hash:t.hash,program:e,inverse:c,openStrip:t.strip,inverseStrip:l,closeStrip:i&&i.strip,loc:this.locInfo(a)}}function u(t,e){if(!e&&t.length){var r=t[0].loc,s=t[t.length-1].loc;r&&s&&(e={source:r.source,start:{line:r.start.line,column:r.start.column},end:{line:s.end.line,column:s.end.column}})}return{type:"Program",body:t,strip:{},loc:e}}function f(t,e,r,i){return s(t,r),{type:"PartialBlockStatement",name:t.path,params:t.params,hash:t.hash,program:e,openStrip:t.strip,closeStrip:r&&r.strip,loc:this.locInfo(i)}}var d=r(1).default;e.__esModule=!0,e.SourceLocation=i,e.id=n,e.stripFlags=a,e.stripComment=o,e.preparePath=c,e.prepareMustache=l,e.prepareRawBlock=h,e.prepareBlock=p,e.prepareProgram=u,e.preparePartialBlock=f;var m=r(6),g=d(m)},function(t,e,r){"use strict";function s(){}function i(t,e,r){if(null==t||"string"!=typeof t&&"Program"!==t.type)throw new h.default("You must pass a string or Handlebars AST to Handlebars.precompile. You passed "+t);e=e||{},"data"in e||(e.data=!0),e.compat&&(e.useDepths=!0);var s=r.parse(t,e),i=(new r.Compiler).compile(s,e);return(new r.JavaScriptCompiler).compile(i,e)}function n(t,e,r){function s(){var s=r.parse(t,e),i=(new r.Compiler).compile(s,e),n=(new r.JavaScriptCompiler).compile(i,e,void 0,!0);return r.template(n)}function i(t,e){return n||(n=s()),n.call(this,t,e)}if(void 0===e&&(e={}),null==t||"string"!=typeof t&&"Program"!==t.type)throw new h.default("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+t);e=p.extend({},e),"data"in e||(e.data=!0),e.compat&&(e.useDepths=!0);var n=void 0;return i._setup=function(t){return n||(n=s()),n._setup(t)},i._child=function(t,e,r,i){return n||(n=s()),n._child(t,e,r,i)},i}function a(t,e){if(t===e)return!0;if(p.isArray(t)&&p.isArray(e)&&t.length===e.length){for(var r=0;r<t.length;r++)if(!a(t[r],e[r]))return!1;return!0}}function o(t){if(!t.path.parts){var e=t.path;t.path={type:"PathExpression",data:!1,depth:0,parts:[e.original+""],original:e.original+"",loc:e.loc}}}var c=r(1).default;e.__esModule=!0,e.Compiler=s,e.precompile=i,e.compile=n;var l=r(6),h=c(l),p=r(5),u=r(35),f=c(u),d=[].slice;s.prototype={compiler:s,equals:function(t){var e=this.opcodes.length;if(t.opcodes.length!==e)return!1;for(var r=0;r<e;r++){var s=this.opcodes[r],i=t.opcodes[r];if(s.opcode!==i.opcode||!a(s.args,i.args))return!1}e=this.children.length;for(var r=0;r<e;r++)if(!this.children[r].equals(t.children[r]))return!1;return!0},guid:0,compile:function(t,e){this.sourceNode=[],this.opcodes=[],this.children=[],this.options=e,this.stringParams=e.stringParams,this.trackIds=e.trackIds,e.blockParams=e.blockParams||[];var r=e.knownHelpers;if(e.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,if:!0,unless:!0,with:!0,log:!0,lookup:!0},r)for(var s in r)this.options.knownHelpers[s]=r[s];return this.accept(t)},compileProgram:function(t){var e=new this.compiler,r=e.compile(t,this.options),s=this.guid++;return this.usePartial=this.usePartial||r.usePartial,this.children[s]=r,this.useDepths=this.useDepths||r.useDepths,s},accept:function(t){if(!this[t.type])throw new h.default("Unknown type: "+t.type,t);this.sourceNode.unshift(t);var e=this[t.type](t);return this.sourceNode.shift(),e},Program:function(t){this.options.blockParams.unshift(t.blockParams);for(var e=t.body,r=e.length,s=0;s<r;s++)this.accept(e[s]);return this.options.blockParams.shift(),this.isSimple=1===r,this.blockParams=t.blockParams?t.blockParams.length:0,this},BlockStatement:function(t){o(t);var e=t.program,r=t.inverse;e=e&&this.compileProgram(e),r=r&&this.compileProgram(r);var s=this.classifySexpr(t);"helper"===s?this.helperSexpr(t,e,r):"simple"===s?(this.simpleSexpr(t),this.opcode("pushProgram",e),this.opcode("pushProgram",r),this.opcode("emptyHash"),this.opcode("blockValue",t.path.original)):(this.ambiguousSexpr(t,e,r),this.opcode("pushProgram",e),this.opcode("pushProgram",r),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue")),this.opcode("append")},DecoratorBlock:function(t){var e=t.program&&this.compileProgram(t.program),r=this.setupFullMustacheParams(t,e,void 0),s=t.path;this.useDecorators=!0,this.opcode("registerDecorator",r.length,s.original)},PartialStatement:function(t){this.usePartial=!0;var e=t.program;e&&(e=this.compileProgram(t.program));var r=t.params;if(r.length>1)throw new h.default("Unsupported number of partial arguments: "+r.length,t);r.length||(this.options.explicitPartialContext?this.opcode("pushLiteral","undefined"):r.push({type:"PathExpression",parts:[],depth:0}));var s=t.name.original,i="SubExpression"===t.name.type;i&&this.accept(t.name),this.setupFullMustacheParams(t,e,void 0,!0);var n=t.indent||"";this.options.preventIndent&&n&&(this.opcode("appendContent",n),n=""),this.opcode("invokePartial",i,s,n),this.opcode("append")},PartialBlockStatement:function(t){this.PartialStatement(t)},MustacheStatement:function(t){this.SubExpression(t),t.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},Decorator:function(t){this.DecoratorBlock(t)},ContentStatement:function(t){t.value&&this.opcode("appendContent",t.value)},CommentStatement:function(){},SubExpression:function(t){o(t);var e=this.classifySexpr(t);"simple"===e?this.simpleSexpr(t):"helper"===e?this.helperSexpr(t):this.ambiguousSexpr(t)},ambiguousSexpr:function(t,e,r){var s=t.path,i=s.parts[0],n=null!=e||null!=r;this.opcode("getContext",s.depth),this.opcode("pushProgram",e),this.opcode("pushProgram",r),s.strict=!0,this.accept(s),this.opcode("invokeAmbiguous",i,n)},simpleSexpr:function(t){var e=t.path;e.strict=!0,this.accept(e),this.opcode("resolvePossibleLambda")},helperSexpr:function(t,e,r){var s=this.setupFullMustacheParams(t,e,r),i=t.path,n=i.parts[0];if(this.options.knownHelpers[n])this.opcode("invokeKnownHelper",s.length,n);else{if(this.options.knownHelpersOnly)throw new h.default("You specified knownHelpersOnly, but used the unknown helper "+n,t);i.strict=!0,i.falsy=!0,this.accept(i),this.opcode("invokeHelper",s.length,i.original,f.default.helpers.simpleId(i))}},PathExpression:function(t){this.addDepth(t.depth),this.opcode("getContext",t.depth);var e=t.parts[0],r=f.default.helpers.scopedId(t),s=!t.depth&&!r&&this.blockParamIndex(e);s?this.opcode("lookupBlockParam",s,t.parts):e?t.data?(this.options.data=!0,this.opcode("lookupData",t.depth,t.parts,t.strict)):this.opcode("lookupOnContext",t.parts,t.falsy,t.strict,r):this.opcode("pushContext")},StringLiteral:function(t){this.opcode("pushString",t.value)},NumberLiteral:function(t){this.opcode("pushLiteral",t.value)},BooleanLiteral:function(t){this.opcode("pushLiteral",t.value)},UndefinedLiteral:function(){this.opcode("pushLiteral","undefined")},NullLiteral:function(){this.opcode("pushLiteral","null")},Hash:function(t){var e=t.pairs,r=0,s=e.length;for(this.opcode("pushHash");r<s;r++)this.pushParam(e[r].value);for(;r--;)this.opcode("assignToHash",e[r].key);this.opcode("popHash")},opcode:function(t){this.opcodes.push({opcode:t,args:d.call(arguments,1),loc:this.sourceNode[0].loc})},addDepth:function(t){t&&(this.useDepths=!0)},classifySexpr:function(t){var e=f.default.helpers.simpleId(t.path),r=e&&!!this.blockParamIndex(t.path.parts[0]),s=!r&&f.default.helpers.helperExpression(t),i=!r&&(s||e);if(i&&!s){var n=t.path.parts[0],a=this.options;a.knownHelpers[n]?s=!0:a.knownHelpersOnly&&(i=!1)}return s?"helper":i?"ambiguous":"simple"},pushParams:function(t){for(var e=0,r=t.length;e<r;e++)this.pushParam(t[e])},pushParam:function(t){var e=null!=t.value?t.value:t.original||"";if(this.stringParams)e.replace&&(e=e.replace(/^(\.?\.\/)*/g,"").replace(/\//g,".")),t.depth&&this.addDepth(t.depth),this.opcode("getContext",t.depth||0),this.opcode("pushStringParam",e,t.type),"SubExpression"===t.type&&this.accept(t);else{if(this.trackIds){var r=void 0;if(!t.parts||f.default.helpers.scopedId(t)||t.depth||(r=this.blockParamIndex(t.parts[0])),r){var s=t.parts.slice(1).join(".");this.opcode("pushId","BlockParam",r,s)}else e=t.original||e,e.replace&&(e=e.replace(/^this(?:\.|$)/,"").replace(/^\.\//,"").replace(/^\.$/,"")),this.opcode("pushId",t.type,e)}this.accept(t)}},setupFullMustacheParams:function(t,e,r,s){var i=t.params;return this.pushParams(i),this.opcode("pushProgram",e),this.opcode("pushProgram",r),t.hash?this.accept(t.hash):this.opcode("emptyHash",s),i},blockParamIndex:function(t){for(var e=0,r=this.options.blockParams.length;e<r;e++){var s=this.options.blockParams[e],i=s&&p.indexOf(s,t);if(s&&i>=0)return[e,i]}}}},function(t,e,r){"use strict";function s(t){this.value=t}function i(){}function n(t,e,r,s){var i=e.popStack(),n=0,a=r.length;for(t&&a--;n<a;n++)i=e.nameLookup(i,r[n],s);return t?[e.aliasable("container.strict"),"(",i,", ",e.quotedString(r[n]),")"]:i}var a=r(1).default;e.__esModule=!0;var o=r(4),c=r(6),l=a(c),h=r(5),p=r(43),u=a(p);i.prototype={nameLookup:function(t,e){return i.isValidJavaScriptVariableName(e)?[t,".",e]:[t,"[",JSON.stringify(e),"]"]},depthedLookup:function(t){return[this.aliasable("container.lookup"),'(depths, "',t,'")']},compilerInfo:function(){var t=o.COMPILER_REVISION;return[t,o.REVISION_CHANGES[t]]},appendToBuffer:function(t,e,r){return h.isArray(t)||(t=[t]),t=this.source.wrap(t,e),this.environment.isSimple?["return ",t,";"]:r?["buffer += ",t,";"]:(t.appendToBuffer=!0,t)},initializeBuffer:function(){return this.quotedString("")},compile:function(t,e,r,s){this.environment=t,this.options=e,this.stringParams=this.options.stringParams,this.trackIds=this.options.trackIds,this.precompile=!s,this.name=this.environment.name,this.isChild=!!r,this.context=r||{decorators:[],programs:[],environments:[]},this.preamble(),this.stackSlot=0,this.stackVars=[],this.aliases={},this.registers={list:[]},this.hashes=[],this.compileStack=[],this.inlineStack=[],this.blockParams=[],this.compileChildren(t,e),this.useDepths=this.useDepths||t.useDepths||t.useDecorators||this.options.compat,this.useBlockParams=this.useBlockParams||t.useBlockParams;var i=t.opcodes,n=void 0,a=void 0,o=void 0,c=void 0;for(o=0,c=i.length;o<c;o++)n=i[o],this.source.currentLocation=n.loc,a=a||n.loc,this[n.opcode].apply(this,n.args);if(this.source.currentLocation=a,this.pushSource(""),this.stackSlot||this.inlineStack.length||this.compileStack.length)throw new l.default("Compile completed with content left on stack");this.decorators.isEmpty()?this.decorators=void 0:(this.useDecorators=!0,this.decorators.prepend("var decorators = container.decorators;\n"),this.decorators.push("return fn;"),s?this.decorators=Function.apply(this,["fn","props","container","depth0","data","blockParams","depths",this.decorators.merge()]):(this.decorators.prepend("function(fn, props, container, depth0, data, blockParams, depths) {\n"),this.decorators.push("}\n"),this.decorators=this.decorators.merge()));var h=this.createFunctionContext(s);if(this.isChild)return h;var p={compiler:this.compilerInfo(),main:h};this.decorators&&(p.main_d=this.decorators,p.useDecorators=!0);var u=this.context,f=u.programs,d=u.decorators;for(o=0,c=f.length;o<c;o++)f[o]&&(p[o]=f[o],d[o]&&(p[o+"_d"]=d[o],p.useDecorators=!0));return this.environment.usePartial&&(p.usePartial=!0),this.options.data&&(p.useData=!0),this.useDepths&&(p.useDepths=!0),this.useBlockParams&&(p.useBlockParams=!0),this.options.compat&&(p.compat=!0),s?p.compilerOptions=this.options:(p.compiler=JSON.stringify(p.compiler),this.source.currentLocation={start:{line:1,column:0}},p=this.objectLiteral(p),e.srcName?(p=p.toStringWithSourceMap({file:e.destName}),p.map=p.map&&p.map.toString()):p=p.toString()),p},preamble:function(){this.lastContext=0,this.source=new u.default(this.options.srcName),this.decorators=new u.default(this.options.srcName)},createFunctionContext:function(t){var e="",r=this.stackVars.concat(this.registers.list);r.length>0&&(e+=", "+r.join(", "));var s=0;for(var i in this.aliases){var n=this.aliases[i];this.aliases.hasOwnProperty(i)&&n.children&&n.referenceCount>1&&(e+=", alias"+ ++s+"="+i,n.children[0]="alias"+s)}var a=["container","depth0","helpers","partials","data"];(this.useBlockParams||this.useDepths)&&a.push("blockParams"),this.useDepths&&a.push("depths");var o=this.mergeSource(e);return t?(a.push(o),Function.apply(this,a)):this.source.wrap(["function(",a.join(","),") {\n  ",o,"}"])},mergeSource:function(t){var e=this.environment.isSimple,r=!this.forceBuffer,s=void 0,i=void 0,n=void 0,a=void 0;return this.source.each(function(t){t.appendToBuffer?(n?t.prepend("  + "):n=t,a=t):(n&&(i?n.prepend("buffer += "):s=!0,a.add(";"),n=a=void 0),i=!0,e||(r=!1))}),r?n?(n.prepend("return "),a.add(";")):i||this.source.push('return "";'):(t+=", buffer = "+(s?"":this.initializeBuffer()),n?(n.prepend("return buffer + "),a.add(";")):this.source.push("return buffer;")),t&&this.source.prepend("var "+t.substring(2)+(s?"":";\n")),this.source.merge()},blockValue:function(t){var e=this.aliasable("helpers.blockHelperMissing"),r=[this.contextName(0)];this.setupHelperArgs(t,0,r);var s=this.popStack();r.splice(1,0,s),this.push(this.source.functionCall(e,"call",r))},ambiguousBlockValue:function(){var t=this.aliasable("helpers.blockHelperMissing"),e=[this.contextName(0)];this.setupHelperArgs("",0,e,!0),this.flushInline();var r=this.topStack();e.splice(1,0,r),this.pushSource(["if (!",this.lastHelper,") { ",r," = ",this.source.functionCall(t,"call",e),"}"])},appendContent:function(t){this.pendingContent?t=this.pendingContent+t:this.pendingLocation=this.source.currentLocation,this.pendingContent=t},append:function(){if(this.isInline())this.replaceStack(function(t){return[" != null ? ",t,' : ""']}),this.pushSource(this.appendToBuffer(this.popStack()));else{var t=this.popStack();this.pushSource(["if (",t," != null) { ",this.appendToBuffer(t,void 0,!0)," }"]),this.environment.isSimple&&this.pushSource(["else { ",this.appendToBuffer("''",void 0,!0)," }"])}},appendEscaped:function(){this.pushSource(this.appendToBuffer([this.aliasable("container.escapeExpression"),"(",this.popStack(),")"]))},getContext:function(t){this.lastContext=t},pushContext:function(){this.pushStackLiteral(this.contextName(this.lastContext))},lookupOnContext:function(t,e,r,s){var i=0;s||!this.options.compat||this.lastContext?this.pushContext():this.push(this.depthedLookup(t[i++])),this.resolvePath("context",t,i,e,r)},lookupBlockParam:function(t,e){this.useBlockParams=!0,this.push(["blockParams[",t[0],"][",t[1],"]"]),this.resolvePath("context",e,1)},lookupData:function(t,e,r){t?this.pushStackLiteral("container.data(data, "+t+")"):this.pushStackLiteral("data"),this.resolvePath("data",e,0,!0,r)},resolvePath:function(t,e,r,s,i){var a=this;if(this.options.strict||this.options.assumeObjects)return void this.push(n(this.options.strict&&i,this,e,t));for(var o=e.length;r<o;r++)this.replaceStack(function(i){var n=a.nameLookup(i,e[r],t);return s?[" && ",n]:[" != null ? ",n," : ",i]})},resolvePossibleLambda:function(){this.push([this.aliasable("container.lambda"),"(",this.popStack(),", ",this.contextName(0),")"])},pushStringParam:function(t,e){this.pushContext(),this.pushString(e),"SubExpression"!==e&&("string"==typeof t?this.pushString(t):this.pushStackLiteral(t))},emptyHash:function(t){this.trackIds&&this.push("{}"),this.stringParams&&(this.push("{}"),this.push("{}")),this.pushStackLiteral(t?"undefined":"{}")},pushHash:function(){this.hash&&this.hashes.push(this.hash),this.hash={values:[],types:[],contexts:[],ids:[]}},popHash:function(){var t=this.hash;this.hash=this.hashes.pop(),this.trackIds&&this.push(this.objectLiteral(t.ids)),this.stringParams&&(this.push(this.objectLiteral(t.contexts)),this.push(this.objectLiteral(t.types))),this.push(this.objectLiteral(t.values))},pushString:function(t){this.pushStackLiteral(this.quotedString(t))},pushLiteral:function(t){this.pushStackLiteral(t)},pushProgram:function(t){null!=t?this.pushStackLiteral(this.programExpression(t)):this.pushStackLiteral(null)},registerDecorator:function(t,e){var r=this.nameLookup("decorators",e,"decorator"),s=this.setupHelperArgs(e,t);this.decorators.push(["fn = ",this.decorators.functionCall(r,"",["fn","props","container",s])," || fn;"])},invokeHelper:function(t,e,r){var s=this.popStack(),i=this.setupHelper(t,e),n=r?[i.name," || "]:"",a=["("].concat(n,s);this.options.strict||a.push(" || ",this.aliasable("helpers.helperMissing")),a.push(")"),this.push(this.source.functionCall(a,"call",i.callParams))},invokeKnownHelper:function(t,e){var r=this.setupHelper(t,e);this.push(this.source.functionCall(r.name,"call",r.callParams))},invokeAmbiguous:function(t,e){this.useRegister("helper");var r=this.popStack();this.emptyHash();var s=this.setupHelper(0,t,e),i=this.lastHelper=this.nameLookup("helpers",t,"helper"),n=["(","(helper = ",i," || ",r,")"];this.options.strict||(n[0]="(helper = ",n.push(" != null ? helper : ",this.aliasable("helpers.helperMissing"))),this.push(["(",n,s.paramsInit?["),(",s.paramsInit]:[],"),","(typeof helper === ",this.aliasable('"function"')," ? ",this.source.functionCall("helper","call",s.callParams)," : helper))"])},invokePartial:function(t,e,r){var s=[],i=this.setupParams(e,1,s);t&&(e=this.popStack(),delete i.name),r&&(i.indent=JSON.stringify(r)),i.helpers="helpers",i.partials="partials",i.decorators="container.decorators",t?s.unshift(e):s.unshift(this.nameLookup("partials",e,"partial")),this.options.compat&&(i.depths="depths"),i=this.objectLiteral(i),s.push(i),this.push(this.source.functionCall("container.invokePartial","",s))},assignToHash:function(t){var e=this.popStack(),r=void 0,s=void 0,i=void 0;this.trackIds&&(i=this.popStack()),this.stringParams&&(s=this.popStack(),r=this.popStack());var n=this.hash;r&&(n.contexts[t]=r),s&&(n.types[t]=s),i&&(n.ids[t]=i),n.values[t]=e},pushId:function(t,e,r){"BlockParam"===t?this.pushStackLiteral("blockParams["+e[0]+"].path["+e[1]+"]"+(r?" + "+JSON.stringify("."+r):"")):"PathExpression"===t?this.pushString(e):"SubExpression"===t?this.pushStackLiteral("true"):this.pushStackLiteral("null")},compiler:i,compileChildren:function(t,e){for(var r=t.children,s=void 0,i=void 0,n=0,a=r.length;n<a;n++){s=r[n],i=new this.compiler;var o=this.matchExistingProgram(s);if(null==o){this.context.programs.push("");var c=this.context.programs.length;s.index=c,s.name="program"+c,this.context.programs[c]=i.compile(s,e,this.context,!this.precompile),this.context.decorators[c]=i.decorators,this.context.environments[c]=s,this.useDepths=this.useDepths||i.useDepths,this.useBlockParams=this.useBlockParams||i.useBlockParams,s.useDepths=this.useDepths,s.useBlockParams=this.useBlockParams}else s.index=o.index,s.name="program"+o.index,this.useDepths=this.useDepths||o.useDepths,this.useBlockParams=this.useBlockParams||o.useBlockParams}},matchExistingProgram:function(t){for(var e=0,r=this.context.environments.length;e<r;e++){var s=this.context.environments[e];if(s&&s.equals(t))return s}},programExpression:function(t){var e=this.environment.children[t],r=[e.index,"data",e.blockParams];return(this.useBlockParams||this.useDepths)&&r.push("blockParams"),this.useDepths&&r.push("depths"),"container.program("+r.join(", ")+")"},useRegister:function(t){this.registers[t]||(this.registers[t]=!0,this.registers.list.push(t))},push:function(t){return t instanceof s||(t=this.source.wrap(t)),this.inlineStack.push(t),t},pushStackLiteral:function(t){this.push(new s(t))},pushSource:function(t){this.pendingContent&&(this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent),this.pendingLocation)),this.pendingContent=void 0),t&&this.source.push(t)},replaceStack:function(t){var e=["("],r=void 0,i=void 0,n=void 0;if(!this.isInline())throw new l.default("replaceStack on non-inline");var a=this.popStack(!0);if(a instanceof s)r=[a.value],e=["(",r],n=!0;else{i=!0;var o=this.incrStack();e=["((",this.push(o)," = ",a,")"],r=this.topStack()}var c=t.call(this,r);n||this.popStack(),i&&this.stackSlot--,this.push(e.concat(c,")"))},incrStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var t=this.inlineStack;this.inlineStack=[];for(var e=0,r=t.length;e<r;e++){var i=t[e];if(i instanceof s)this.compileStack.push(i);else{var n=this.incrStack();this.pushSource([n," = ",i,";"]),this.compileStack.push(n)}}},isInline:function(){return this.inlineStack.length},popStack:function(t){var e=this.isInline(),r=(e?this.inlineStack:this.compileStack).pop();if(!t&&r instanceof s)return r.value;if(!e){if(!this.stackSlot)throw new l.default("Invalid stack pop");this.stackSlot--}return r},topStack:function(){var t=this.isInline()?this.inlineStack:this.compileStack,e=t[t.length-1];return e instanceof s?e.value:e},contextName:function(t){return this.useDepths&&t?"depths["+t+"]":"depth"+t},quotedString:function(t){return this.source.quotedString(t)},objectLiteral:function(t){return this.source.objectLiteral(t)},aliasable:function(t){var e=this.aliases[t];return e?(e.referenceCount++,e):(e=this.aliases[t]=this.source.wrap(t),e.aliasable=!0,e.referenceCount=1,e)},setupHelper:function(t,e,r){var s=[];return{params:s,paramsInit:this.setupHelperArgs(e,t,s,r),name:this.nameLookup("helpers",e,"helper"),callParams:[this.aliasable(this.contextName(0)+" != null ? "+this.contextName(0)+" : (container.nullContext || {})")].concat(s)}},setupParams:function(t,e,r){var s={},i=[],n=[],a=[],o=!r,c=void 0;o&&(r=[]),s.name=this.quotedString(t),s.hash=this.popStack(),this.trackIds&&(s.hashIds=this.popStack()),this.stringParams&&(s.hashTypes=this.popStack(),s.hashContexts=this.popStack());var l=this.popStack(),h=this.popStack();(h||l)&&(s.fn=h||"container.noop",s.inverse=l||"container.noop");for(var p=e;p--;)c=this.popStack(),r[p]=c,this.trackIds&&(a[p]=this.popStack()),this.stringParams&&(n[p]=this.popStack(),i[p]=this.popStack());return o&&(s.args=this.source.generateArray(r)),this.trackIds&&(s.ids=this.source.generateArray(a)),this.stringParams&&(s.types=this.source.generateArray(n),s.contexts=this.source.generateArray(i)),this.options.data&&(s.data="data"),this.useBlockParams&&(s.blockParams="blockParams"),s},setupHelperArgs:function(t,e,r,s){var i=this.setupParams(t,e,r);return i=this.objectLiteral(i),s?(this.useRegister("options"),r.push("options"),["options=",i]):r?(r.push(i),""):i}},function(){for(var t="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield await null true false".split(" "),e=i.RESERVED_WORDS={},r=0,s=t.length;r<s;r++)e[t[r]]=!0}(),i.isValidJavaScriptVariableName=function(t){return!i.RESERVED_WORDS[t]&&/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(t)},e.default=i,t.exports=e.default},function(t,e,r){"use strict";function s(t,e,r){if(n.isArray(t)){for(var s=[],i=0,a=t.length;i<a;i++)s.push(e.wrap(t[i],r));return s}return"boolean"==typeof t||"number"==typeof t?t+"":t}function i(t){this.srcFile=t,this.source=[]}e.__esModule=!0;var n=r(5),a=void 0;a||(a=function(t,e,r,s){this.src="",s&&this.add(s)},a.prototype={add:function(t){n.isArray(t)&&(t=t.join("")),this.src+=t},prepend:function(t){n.isArray(t)&&(t=t.join("")),this.src=t+this.src},toStringWithSourceMap:function(){return{code:this.toString()}},toString:function(){return this.src}}),i.prototype={isEmpty:function(){return!this.source.length},prepend:function(t,e){this.source.unshift(this.wrap(t,e))},push:function(t,e){this.source.push(this.wrap(t,e))},merge:function(){var t=this.empty();return this.each(function(e){t.add(["  ",e,"\n"])}),t},each:function(t){for(var e=0,r=this.source.length;e<r;e++)t(this.source[e])},empty:function(){var t=this.currentLocation||{start:{}};return new a(t.start.line,t.start.column,this.srcFile)},wrap:function(t){var e=arguments.length<=1||void 0===arguments[1]?this.currentLocation||{start:{}}:arguments[1];return t instanceof a?t:(t=s(t,this,e),new a(e.start.line,e.start.column,this.srcFile,t))},functionCall:function(t,e,r){return r=this.generateList(r),this.wrap([t,e?"."+e+"(":"(",r,")"])},quotedString:function(t){return'"'+(t+"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+'"'},objectLiteral:function(t){var e=[];for(var r in t)if(t.hasOwnProperty(r)){var i=s(t[r],this);"undefined"!==i&&e.push([this.quotedString(r),":",i])}var n=this.generateList(e);return n.prepend("{"),n.add("}"),n},generateList:function(t){for(var e=this.empty(),r=0,i=t.length;r<i;r++)r&&e.add(","),e.add(s(t[r],this));return e},generateArray:function(t){var e=this.generateList(t);return e.prepend("["),e.add("]"),e}},e.default=i,t.exports=e.default}])});
},{}],11:[function(require,module,exports){
'use strict'

const PageScript = require('./PageScript');

module.exports = class ObjectManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shift=[];
    this.position=[];

    this.getObjectData();

    this.setListeners();

  }

  handleObjectData(reps){
    [this.shift, this.position] = reps;

    this.sortAndRender('shift', 'shiftArea');
    this.sortAndRender('position', 'positionArea');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.getObjectData);
  }
}
},{"./PageScript":2}],12:[function(require,module,exports){
'use strict'

const PageScript = require('./PageScript');
const {compare,
  getMiddleMonthes,
  prepareCalendar,
  preparePersons,
  getFilterData,
  concatVacations
} = require('./helpers');

module.exports = class ShiftCalendar extends PageScript{
  constructor(selectors){
    super(selectors);

    this.calendar = [];
    this.shift = [];

    this.sort = 'shift';

    this.defaults = {
      title:'',
      dayWidth:20,
      calendar: {
        monthes:[],
        dates:[]
      }
    };

    this.graphData=this.defaults;

    this.setCalendar = this.setCalendar.bind(this);
    this.getObjectData();
    this.setListeners();
  }

  setCalendar(rep){
    this.calendar = rep;

    this.prepareGraphData();
  }

  clearGraphData(){
    this.graphData=this.defaults;
  }

  prepareGraphData(){
    this.prepareHeadRow();
    this.prepareShifts();
    this.fillDutyArray();

    this.render('graphData', 'calendarArea');
    this.render('shift', 'shiftCalendar');
  }

  prepareHeadRow(){
    this.clearGraphData();

    const {mFrom, mTo, yFrom, yTo} = getFilterData();
    const {dayWidth} = this.graphData;

    this.graphData.calendar.monthes = getMiddleMonthes(mFrom, yFrom, mTo, yTo, dayWidth);

    const {monthes} = this.graphData.calendar;

    this.graphData.calendar.dates = prepareCalendar(yFrom, monthes);

    this.graphData.title = `Расписание дежурств ${mFrom}-${yFrom} - ${mTo}-${yTo}`;
  }

  prepareShifts(){
    this.shift.forEach(shift=>{
      shift.dutyArray = [];
    });
  }

  fillDutyArray(){
    this.calendar.forEach(date=>{
      this.shift.forEach(shiftObj=>{
        const {shift} = shiftObj;

        if(date.shift.includes(shift)) shiftObj.dutyArray.push(true);
        else shiftObj.dutyArray.push(false);

        shiftObj.dayWidth = this.graphData.dayWidth;
      });
    });

    console.log(this.shift)
  }

  handleObjectData(rep){
    [this.shift] = rep;
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.setCalendar);
  }
}
},{"./PageScript":2,"./helpers":5}],13:[function(require,module,exports){
'use strict'

const {getVacationHandout} = require('./helpers');
const PageScript = require('./PageScript');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.person=[];
    this.vacation=[];
    this.problemsCalendar = [];

    this.getVacationData();

    this.setListeners();

    this.getEmployeData();
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.getVacationData);
  }

  handleEmployeData(rep){
    this.person=rep;

    this.sortAndRender('person', 'personSelect');
  }

  handleVacationData(rep){
    this.vacation=rep;

    this.getVacationHandout();
    this.sortAndRender('vacation', 'vacationSelect');
  }

  getVacationHandout(){
    return getVacationHandout()
      .then(rep=>{
        if (rep.length === 0) rep.push(false);

        this.problemsCalendar = rep;

        this.render('problemsCalendar', 'problemsCalendarHandout');
      })
      .catch(err=>console.log(err));
  }
}
},{"./PageScript":2,"./helpers":5}],14:[function(require,module,exports){
'use strict'

const PageScript = require('./PageScript');

module.exports = class XraySchedule extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shift = [];
    this.calendar = [];
    this.week = [
      'понедельник',
      'вторник',
      'среда',
      'четверг',
      'пятница',
      'суббота',
      'воскресенье'
    ]

    this.setCalendar = this.setCalendar.bind(this);
    this.setListeners();
  }

  setCalendar(rep){
    [this.calendar, this.shift] = rep;

    this.setColSpan('tableCol');
    this.render('calendar', 'calendarArea');
    this.render('shift', 'shiftArea');
  }

  setColSpan(selector){
    let spanLength = 0;

    this.shift.forEach(shiftPair=>{
      spanLength += shiftPair.length;
    });

    document.getElementById(selector).setAttribute('span', spanLength);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.setCalendar);
  }
}

},{"./PageScript":2}]},{},[6]);
