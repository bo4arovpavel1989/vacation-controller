'use strict'

const {PageScript} = require('./helpers');

module.exports = class ObjectManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shift=[];
    this.position=[];
    this.shiftSort = 1;
    this.positionSort = 1;

    this.getObjectData(this.handleObjectData);

    this.setListeners();

  }

  handleObjectData(reps){
    [this.shift, this.position] = reps;

    this.sortAndRender('shift', 'shiftArea');
    this.sortAndRender('position', 'positionArea');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>
      this.getObjectData(this.handleObjectData));
  }
}
