'use strict'

const {FormsHandler, getObjectData, compare} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class ObjectManagment {
  constructor(){
    this.shifts=[];
    this.positions=[];
    this.shiftSort = 1;
    this.positionSort = 1;
    this.getObjectData();

    this.formsHandler = new FormsHandler({
      formsSelector: '.objectManagmentForm'
    });

    this.setListeners();

  }

  getObjectData(){
    getObjectData()
      .then(reps=>{
        [this.shifts, this.positions] = reps;

        this.sortAndRender('shift');
        this.sortAndRender('position');
      });

  }

  sortAndRender(entry){
    this[`${entry}s`] = this[`${entry}s`].sort(compare(entry, this[`${entry}Sort`]));
    this.render(`${entry}s`);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getObjectData());
  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(`${data}Area`).innerHTML = html;
    this.formsHandler.refreshListeners();
  }

}
