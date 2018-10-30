'use strict'

const {compare, getObjectData, FormsHandler, getDayInMonth, getMiddleMonthes} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment {
  constructor(){
    this.shifts=[];
    this.positions=[];
    this.graphData={};

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
    this.formsHandler.ee.on('refreshRender', data=>this.prepareGraphData(data));
  }

  prepareGraphData(data){
    const monthFrom = document.getElementsByName("monthFrom")[0].value;
    const monthTo = ${document.getElementsByName("monthTo")[0].value};

    this.graphData.title = `${monthFrom}-` +
    `${document.getElementsByName("yearFrom")[0].value} - ` +
    `${monthTo}-` +
    `${document.getElementsByName("yearTo")[0].value} `;

    console.log(getDayInMonth('03'))
  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(`${data}Select`).innerHTML = html;
  }
}
