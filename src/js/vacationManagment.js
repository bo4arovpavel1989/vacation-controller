'use strict'

const {FormsHandler, getData, compare} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment {
  constructor(){
    this.persons=[];
    this.vacations=[];
    this.getEmployeData();
    this.getVacationData();
    this.formsHandler = new FormsHandler({
      popupButtonSelector: '.popupButton',
      formsSelector: '.vacationManagmentForm',
      deleteSelector: '.deleteObject',
      editSelector: '.editObject',
      editFormSelector: '#editForm'
    });
    this.setListeners();
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getVacationData());
  }

  getEmployeData(){
    getData('getobject/Person')
    .then(rep=>{
      this.persons=rep.sort(compare('person', 1));
      this.render('persons');
    })
    .catch(err=>console.log(err));

  }

  getVacationData(){
    getData('getobject/Vacation')
    .then(rep=>{
      this.vacations=rep.sort(compare('person', 1));
      this.render('vacations');
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
