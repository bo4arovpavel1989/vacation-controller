'use strict'

const {compare, getObjectData, FormsHandler} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment {
  constructor(){
    this.shifts=[];
    this.positions=[];

    this.formsHandler = new FormsHandler({
      formsSelector: '.filterManagmentForm'
    });

    getObjectData()
      .then(reps=>{
        [this.shifts, this.positions] = reps;

        this.sortAndRender('shift');
        this.sortAndRender('position');
      });

      this.setListeners();
  }

  sortAndRender(entry){
    this[`${entry}s`] = this[`${entry}s`].sort(compare(entry, this[`${entry}Sort`]));
    this.render(`${entry}s`);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', r=>console.log(r));
  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(`${data}Select`).innerHTML = html;
    }
}
