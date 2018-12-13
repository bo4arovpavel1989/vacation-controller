'use strict'

const {compare, getObjectData, getEmployeData, PageScript} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.persons=[];
    this.shifts=[];
    this.positions=[];
    this.shiftSort = 1;
    this.positionSort = 1;
    this.personSort = 1;

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
    this.render(`${entry}s`, `${entry}sSelect`);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getEmployeData());
  }
}
