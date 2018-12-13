'use strict'

const {getObjectData, compare, PageScript} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class ObjectManagment  extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shifts=[];
    this.positions=[];
    this.shiftSort = 1;
    this.positionSort = 1;
    this.getObjectData();

    this.setListeners();

  }

  getObjectData(){
    getObjectData()
      .then(reps=>{
        [this.shifts, this.positions] = reps;

        this.sortAndRender('shift', 'shiftsArea');
        this.sortAndRender('position', 'positionsArea');
      });

  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getObjectData());
  }
}
