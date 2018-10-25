(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports.API_URL = 'http://localhost:8080';

module.exports.getPage = function() {
  let idElement = document.getElementById('pageId');
  
  return idElement.dataset.id;
}

},{}],2:[function(require,module,exports){
'use strict'

module.exports = class EmployeManagment {
  constructor(){

  }



}

},{}],3:[function(require,module,exports){
'use strict'

const {API_URL} = require('./config');

const handleResponse = response=>response.json().then(json=>response.ok ? json : Promise.reject(json));

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

    if(input.type !== 'submit')
      formBody[input.name] = input.value;
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
    fetch(`${API_URL}/${url}`, {
      method:'POST',
      mode:'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(data)
    })
    .then(handleResponse)
    .then(rep=>resolve(rep))
    .catch(err=>reject(err))
  });
};

module.exports.postData = postData;

/**
* Class made to handle all button calling popup forms and handle submits
* Form must be wrapped in div with class 'popup' and id made by concat of
* the calling button id plus 'FormArea'
* Class popedup must be defined in css for showing popups
*/
module.exports.FormsHandler = class FormsHandler {

  /**
    * Create listener.
    * @param {sting} buttonSelector - selector of button to call popup form.
    * @param {string} formsSelector - selector of form to call submit.
    */
  constructor(buttonSelector, formsSelector){
    this.buttonSelector = buttonSelector;
    this.formsSelector = formsSelector;
    this.isPopup = false;
    this.listeners();
  }

  /**
  * Adds listeners for clicking and submitting
  * @returns {void}
  */
  listeners(){
    this.isPopup = false;
    const addButtons = document.querySelectorAll(this.buttonSelector);
    const addForms = document.querySelectorAll(this.formsSelector);

    addButtons.forEach(button=>{
      button.addEventListener('click', e=>this.buttonClickHandler(e, button.id))
    });

    addForms.forEach(form=>{
      form.addEventListener('submit', e=>this.formHandler(e))
    });

    document
      .getElementById('container')
      .addEventListener('click', this.closePopup);

  }

  /**
  * Close all popups
  * @returns {void}
  */
  closePopup(){
    alert(this.isPopup);
    if(this.isPopup) {
      const popups = document.querySelectorAll('.popup');

      this.isPopup = false;
      popups.forEach(p=>{
        p.classList.remove('popedUp');
      })
    }
  }

  /**
  * Handles click on button and popups its form
  * @returns {void}
  */
  buttonClickHandler(e, id){
    e.stopPropagation();
    const el = document.getElementById(`${id}FormArea`);

    this.isPopup = true;
      alert(this.isPopup);
    el.classList.add('popedUp');
  }

  /**
  * Submits form
  * @returns {void}
  */
  formHandler(e){
    e.preventDefault();

    postData(e.target.dataset.url, getForm(e.target))
      .then(()=>this.closePopup())
      .catch(err=>console.log(err))
  }

}

},{"./config":1}],4:[function(require,module,exports){
'use strict';

const {getPage} = require('./config');
const ObjectManagment = require('./objectManagment');
const VacationManagment = require('./vacationManagment');
const Infotable = require('./infotable');
const EmployeManagment = require('./employeManagment');
let pageScript;

switch(getPage()) {
  case 'objectManagment':
    pageScript = new ObjectManagment()
    break;
  case 'vacationManagment':
    pageScript = new VacationManagment()
    break;
  case 'infotable':
    pageScript = new Infotable();
    break;
  case 'employeManagment':
    pageScript = new EmployeManagment();
    break;
  default:
    pageScript = null;
}

},{"./config":1,"./employeManagment":2,"./infotable":5,"./objectManagment":6,"./vacationManagment":7}],5:[function(require,module,exports){
'use strict'

module.exports = class Infotable {
  constructor(){

  }

}

},{}],6:[function(require,module,exports){
'use strict'
const {FormsHandler} = require('./helpers');

module.exports = class ObjectManagment {
  constructor(){
    this.setFormHandlers();
  }

  setFormHandlers(){
    const formsHandler = new FormsHandler('.addButton', '.addForm');
  }

}

},{"./helpers":3}],7:[function(require,module,exports){
'use strict'

module.exports = class VacationManagment {
  constructor(){

  }

}

},{}]},{},[4]);
