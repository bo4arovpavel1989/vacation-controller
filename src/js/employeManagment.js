'use strict'

const {FormsHandler, getData, compare} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment {
  constructor(){
    this.persons=[];
    this.shifts=[];
    this.positions=[];
    this.getObjectData();
    this.getEmployeData();
    this.formsHandler = new FormsHandler({
      popupButtonSelector: '.popupButton',
      formsSelector: '.employeManagmentForm',
      deleteSelector: '.deleteObject',
      editSelector: '.editObject',
      editFormSelector: '#editForm'
    });
    this.setListeners();
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getEmployeData());
  }

  getObjectData(){
    getData('getobject/Shift')
    .then(rep=>{
      this.shifts=rep.sort(compare('shift', 1));
      this.render('shifts');
    })
    .catch(err=>console.log(err));

    getData('getobject/Position')
    .then(rep=>{
      this.positions = rep.sort(compare('position', 1));
      this.render('positions');
    })
    .catch(err=>console.log(err));
  }

  getEmployeData(){
    getData('getobject/Person')
    .then(rep=>{
      this.persons=rep.sort(compare('person', 1));
      this.render('persons');
    })
    .catch(err=>console.log(err));

  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = {arr: this[data]};
    const html = template(context);

    document.getElementById(`${data}Select`).innerHTML = html;
    this.formsHandler.refreshListeners();
    }
}
