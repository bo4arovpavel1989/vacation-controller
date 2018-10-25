'use strict'

const {FormsHandler, getData} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class ObjectManagment {
  constructor(){
    this.getObjectData();
    this.shifts=[];
    this.positions=[];
    this.formsHandler = new FormsHandler('.addButton', '.addForm', '.deleteObject');
    this.setFormHandlersListeners();
  }

  setFormHandlersListeners(){
    this.formsHandler.ee.on('formHandled', ()=>this.getObjectData())
    this.formsHandler.ee.on('objectDeleted', ()=>this.getObjectData())
  }

  getObjectData(){
    getData('getobject/Shift')
    .then(rep=>{
      this.shifts=rep;
      this.render('shifts');
    })
    .catch(err=>console.log(err));

    getData('getobject/Position')
    .then(rep=>{
      this.positions = rep;
      this.render('positions');
    })
    .catch(err=>console.log(err));
  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = {arr: this[data]};
    const html = template(context);

    document.getElementById(`${data}Area`).innerHTML = html;
    this.formsHandler.refreshListeners();
  }

}
