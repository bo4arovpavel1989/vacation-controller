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
    * @param {String} buttonSelector - selector of button to call popup form.
    * @param {String} formsSelector - selector of form to call submit.
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
      .addEventListener('click', ()=>this.closePopup());

  }

  /**
  * Close all popups
  * @returns {void}
  */
  closePopup(){
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
  * @param {Object} e - event Object
  * @param {String} id - id of button
  * @returns {void}
  */
  buttonClickHandler(e, id){
    e.stopPropagation();
    this.closePopup();
    const el = document.getElementById(`${id}FormArea`);

    this.isPopup = true;
    el.classList.add('popedUp');
  }

  /**
  * Submits form
  * @param {Object} e - event object
  * @returns {void}
  */
  formHandler(e){
    e.preventDefault();

    postData(e.target.dataset.url, getForm(e.target))
      .then(()=>this.closePopup())
      .catch(err=>console.log(err))
  }

}
