'use strict'

const {PageScript} = require('./helpers');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.person=[];
    this.shift=[];
    this.position=[];
    this.shiftSort = 1;
    this.positionSort = 1;
    this.personSort = 1;

    this.setListeners();

    this.getObjectData(this.handleObjectData);

    this.getEmployeData(this.handleEmployeData);
  }

  handleEmployeData(rep){
    this.person=rep;

    this.sortAndRender('person', 'personsSelect');
  }

  handleObjectData(reps){
    [this.shift, this.position] = reps;

    this.sortAndRender('shift', 'shiftsSelect');
    this.sortAndRender('position', 'positionsSelect');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>
      this.getEmployeData(this.handleEmployeData)
    );
  }
}
