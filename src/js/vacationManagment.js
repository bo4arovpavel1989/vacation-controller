'use strict'

const {getVacationHandout, PageScript} = require('./helpers');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.persons=[];
    this.vacations=[];
    this.vacationSort = 1;
    this.personSort = 1;
    this.problemsCalendar = [];

    this.getVacationData(rep=>this.handleVacationData(rep));

    this.setListeners();

    this.getEmployeData(rep=>this.handleEmployeData(rep));
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>
      this.getVacationData(rep=>this.handleVacationData(rep))
    );
  }

  handleEmployeData(rep){
    this.persons=rep;

    this.sortAndRender('person', 'personsSelect');
  }

  handleVacationData(rep){
    this.vacations=rep;

    this.getVacationHandout();
    this.sortAndRender('vacation', 'vacationsSelect');
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
}
