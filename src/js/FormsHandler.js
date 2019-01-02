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