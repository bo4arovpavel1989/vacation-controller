'use strict'

const {getEmployeData, getVacationData, getVacationHandout, compare, PageScript} = require('./helpers');
const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment  extends PageScript{
  constructor(selectors){
    super(selectors);

    this.persons=[];
    this.vacations=[];
    this.vacationSort = 1;
    this.personSort = 1;
    this.problemsCalendar = [];

    this.getVacationData();

    this.setListeners();

    getEmployeData()
      .then(rep=>{
        this.persons=rep;

        this.sortAndRender('person', 'personsSelect');
      });
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>this.getVacationData());
  }

  getVacationHandout(){
    return getVacationHandout()
      .then(rep=>{
        if (rep.length === 0) rep.push(false);

        this.problemsCalendar = rep;

        console.log(rep)

        this.render('problemsCalendar', 'problemsCalendarHandout');
      })
      .catch(err=>console.log(err));
  }

  getVacationData(){
    return getVacationData()
      .then(rep=>{
        this.vacations=rep;

        this.getVacationHandout();
        this.sortAndRender('vacation', 'vacationsSelect');
      })
        .catch(err=>console.log(err));
      }
}
