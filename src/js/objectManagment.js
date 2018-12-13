'use strict'

const {PageScript} = require('./helpers');

module.exports = class ObjectManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shifts=[];
    this.positions=[];
    this.shiftSort = 1;
    this.positionSort = 1;
    this.getObjectData(this.handleObjectData);

    this.setListeners();

  }

  handleObjectData(reps){
    [this.shifts, this.positions] = reps;

    this.sortAndRender('shift', 'shiftsArea');
    this.sortAndRender('position', 'positionsArea');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getObjectData());
  }
}
