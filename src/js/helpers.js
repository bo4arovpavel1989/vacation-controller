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
* Class 'popedUp' must be defined in css for showing popups
*/
module.exports.FormsHandler = class FormsHandler {

  /**
    * Create listener.
    * @param {String} buttonSelector - selector of button to call popup form.
    * @param {String} formsSelector - selector of form to call submit.
    */
  constructor(selectors){
    this.popupButtonSelector = selectors.popupButtonSelector || '';
    // Must be ClassName!!!
    this.formsSelector = selectors.formsSelector || '';
    this.deleteSelector = selectors.deleteSelector || '';
    this.editSelector = selectors.editSelector || '';
    this.editFormSelector = selectors.editFormSelector || '';
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
        link.addEventListener('click', e=>this.editLinkHandler(e));
        link.dataset.hasEditListener = true;
      }
    });

    const container = document.getElementById('container');

    if(!container.dataset.hasClickListener){
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
  * @param {string} form - data-form attr of popup button
  * @returns {void}
  */
  openPopup(form){
    const el = document.getElementById(`${form}FormArea`);

    this.isPopup = true;
    el.classList.add('popedUp');
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
    this.openPopup(form);
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
        this.emit('refreshRender');
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

  /**
  * Get API response object, transfirm it amd render in Handlebars
  * @param {Object} obj - API response object
  * @returns {void}
  */
  renderEditForm(obj){
    const renderData = this.transformObjectForRender(obj);
    const source = document.querySelector(this.editFormSelector).innerHTML;
    const template = Handlebars.compile(source);
    const context = renderData;
    const html = template(context);

    document.querySelector(`${this.editFormSelector}Area`).innerHTML = html;
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

    for (let i in obj) {
      if(i !== 'type' && i !== '_id') {
        const input = {name:i};

        if(typeof input.value !== 'string'){
          input.type = typesMap[typeof obj[i]];
          input.value = obj[i];
        } else if (isNaN(Date.parse(input.value))) {
          input.type = 'text';
          input.value = obj[i];
        } else {
          input.type='date';
          input.value = Date.parse(obj[i]);
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
