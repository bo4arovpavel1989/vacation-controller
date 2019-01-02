'use strict'

const PageScript = require('./PageScript');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.person=[];
    this.shift=[];
    this.position=[];

    this.setListeners();

    this.getObjectData();

    this.getEmployeData();
  }

  handleEmployeData(rep){
    this.person=rep;

    this.sortAndRender('person', 'personSelect');
  }

  handleObjectData(reps){
    [this.shift, this.position] = reps;

    this.sortAndRender('shift', 'shiftSelect');
    this.sortAndRender('position', 'positionSelect');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.getEmployeData);
  }
}