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

        this.sortAndRender('shift', 'shiftArea');
        this.sortAndRender('position', 'positionArea');
      });

  }

  sortAndRender(entry){
    this[`${entry}s`] = this[`${entry}s`].sort(compare(entry, this[`${entry}Sort`]));
    this.render(`${entry}s`, `${entry}sArea`);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getObjectData());
  }
}
