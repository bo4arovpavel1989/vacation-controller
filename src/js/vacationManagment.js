'use strict'

const {getVacationHandout, PageScript} = require('./helpers');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.person=[];
    this.vacation=[];
    this.vacationSort = 1;
    this.personSort = 1;
    this.problemsCalendar = [];

    this.getVacationData(this.handleVacationData);

    this.setListeners();

    this.getEmployeData(this.handleEmployeData);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>
      this.getVacationData(this.handleVacationData)
    );
  }

  handleEmployeData(rep){
    this.persons=rep;

    this.sortAndRender('person', 'personSelect');
  }

  handleVacationData(rep){
    this.vacations=rep;

    this.getVacationHandout();
    this.sortAndRender('vacation', 'vacationSelect');
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
