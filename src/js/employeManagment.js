'use strict'

const {PageScript} = require('./helpers');

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

    this.getObjectData(rep=>this.handleObjectData(rep))

    this.getEmployeData(rep=>this.handleEmployeData(rep));
  }

  handleEmployeData(rep){
    this.persons=rep;

    this.sortAndRender('person', 'personsSelect');
  }

  handleObjectData(reps){
    [this.shifts, this.positions] = reps;

    this.sortAndRender('shift', 'shiftsSelect');
    this.sortAndRender('position', 'positionsSelect');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>
      this.getEmployeData(rep=>this.handleEmployeData(rep))
    );
  }
}
