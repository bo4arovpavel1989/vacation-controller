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
