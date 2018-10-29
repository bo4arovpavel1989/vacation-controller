'use strict'

const {FormsHandler, compare, getObjectData, getEmployeData} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment {
  constructor(){
    this.persons=[];
    this.shifts=[];
    this.positions=[];
    this.shiftSort = 1;
    this.positionSort = 1;
    this.personSort = 1;

    this.formsHandler = new FormsHandler({
      formsSelector: '.employeManagmentForm'
    });
    
    this.setListeners();

    getObjectData()
      .then(reps=>{
        [this.shifts, this.positions] = reps;

        this.sortAndRender('shift');
        this.sortAndRender('position');
      });

    this.getEmployeData();
  }

  getEmployeData(){
    getEmployeData()
      .then(rep=>{
        this.persons=rep;

        this.sortAndRender('person');
      })
  }

  sortAndRender(entry){
    this[`${entry}s`] = this[`${entry}s`].sort(compare(entry, this[`${entry}Sort`]));
    this.render(`${entry}s`);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getEmployeData());
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
