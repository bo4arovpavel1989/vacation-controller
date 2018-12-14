'use strict'

const PageScript = require('./PageScript');

module.exports = class ObjectManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shift=[];
    this.position=[];

    this.getObjectData();

    this.setListeners();

  }

  handleObjectData(reps){
    [this.shift, this.position] = reps;

    this.sortAndRender('shift', 'shiftArea');
    this.sortAndRender('position', 'positionArea');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.getObjectData);
  }
}
