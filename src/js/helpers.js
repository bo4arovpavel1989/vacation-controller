'use strict'

const {API_URL} = require('./config');
const EventEmitter = require('./libs/events.min');
const Handlebars = require('./libs/h.min');

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
* Fuction makes get request to API
* @param {String} url - url to request to
* @returns {Promise} - response object
*/
const getData = function (url) {
 return new Promise((resolve, reject)=>{
   fetch(`${API_URL}/${url}`, {
     method:'GET',
     mode:'cors',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json'
     }
   })
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
   fetch(`${API_URL}/${url}`, {
     method:'DELETE',
     mode:'cors',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json'
     }
   })
   .then(handleResponse)
   .then(rep=>resolve(rep))
   .catch(err=>reject(err))
 });
}

module.exports.deleteData = deleteData;

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
  constructor(buttonSelector, formsSelector, deleteSelector, editSelector){
    this.buttonSelector = buttonSelector;
    this.formsSelector = formsSelector;
    this.deleteSelector = deleteSelector;
    this.editSelector = editSelector;
    this.isPopup = false;
    this.ee = new EventEmitter();
    this.addListeners();
  }

  /**
  * Adds listeners for clicking and submitting
  * @returns {void}
  */
  addListeners(){
    this.isPopup = false;
    const addButtons = document.querySelectorAll(this.buttonSelector);
    const addForms = document.querySelectorAll(this.formsSelector);
    const deleteLinks = document.querySelectorAll(this.deleteSelector);
    const editLinks = document.querySelectorAll(this.editSelector);

    addButtons.forEach(button=>{
      if(!button.dataset.hasListener) {
        button.addEventListener('click', e=>this.buttonClickHandler(e, button.id));
        button.dataset.hasListener = true;
      }
    });

    addForms.forEach(form=>{
      if(!form.dataset.hasListener) {
        form.addEventListener('submit', e=>this.formHandler(e))
        form.dataset.hasListener = true;
      }
    });

    deleteLinks.forEach(link=>{
      if(!link.dataset.hasListener) {
        link.addEventListener('click', e=>this.deleteHandler(e))
        link.dataset.hasListener = true;
      }
    });

    editLinks.forEach(link=>{
      if(!link.dataset.hasListener) {
        link.addEventListener('click', e=>this.editLinkHandler(e));
        link.dataset.hasListener = true;
      }
    });

    document
      .getElementById('container')
      .addEventListener('click', ()=>this.closePopup());

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
      .then(()=>{
        this.closePopup();
        this.emit('formHandled');
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
          this.emit('objectDeleted');
        })
        .catch(err=>console.log(err))
  }

  /**
  * Send delete request and then emits that object deleted to refresh state
  * @param {Object} e - event object
  * @returns {void}
  */
  editLinkHandler(e){
    const obj = {
      id: e.target.dataset.id,
      object: e.target.dataset.object
    };

    getData(`getobject/${obj.object}/${obj.id}`)
      .then(rep=>this.renderEditForm(rep[0]))
      .catch(err=>console.log(err));
  }

  renderEditForm(obj){
    console.log(this.transformObjectForRender(obj))
  }

  transformObjectForRender(obj){
    let renderObject = {object:obj.type, id:obj._id, input:[]};
    const typesMap = {
      string: 'text',
      number: 'number',
      date: 'date'
    }

    for (let i in obj) {
      if(i !== 'type' && i !== '_id') {
        const input = {name:i, value:obj[i]};

        if(typeof input.value !== 'string'){
          input.type = typesMap[typeof obj[i]];
        } else if (isNaN(Date.parse(input.value))) {
          input.type = 'text';
        } else {
          input.type='date';
        }

        renderObject.input.push(input);
      }
    }

    return renderObject;
  }

  emit(message){
    this.ee.emit(message);
  }

}
