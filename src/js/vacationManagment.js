'use strict'

const {FormsHandler, getEmployeData, getVacationData, getVacationHandout, compare} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment {
  constructor(){
    this.persons=[];
    this.vacations=[];
    this.vacationSort = 1;
    this.personSort = 1;

    this.getVacationData();
    this.getVacationHandout();

    this.formsHandler = new FormsHandler({
      formsSelector: '.vacationManagmentForm'
    });

    this.setListeners();

    getEmployeData()
      .then(rep=>{
        this.persons=rep;

        this.sortAndRender('person');
      });
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getVacationData());
  }

  getVacationHandout(){
    getVacationHandout();
  }

  getVacationData(){
    getVacationData()
    .then(rep=>{
      this.vacations=rep;

      this.sortAndRender('vacation');
    })
      .catch(err=>console.log(err));
    }

  sortAndRender(entry){
      this[`${entry}s`] = this[`${entry}s`].sort(compare('person', this[`${entry}Sort`]));
      this.render(`${entry}s`);
  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(`${data}Select`).innerHTML = html;
    this.formsHandler.refreshListeners();
  }
}
