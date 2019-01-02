'use strict'

const {getVacationHandout} = require('./helpers');
const PageScript = require('./PageScript');

module.exports = class EmployeManagment extends PageScript{
  constructor(selectors){
    super(selectors);

    this.person=[];
    this.vacation=[];
    this.problemsCalendar = [];

    this.getVacationData();

    this.setListeners();

    this.getEmployeData();
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.getVacationData);
  }

  handleEmployeData(rep){
    this.person=rep;

    this.sortAndRender('person', 'personSelect');
  }

  handleVacationData(rep){
    this.vacation=rep;

    this.getVacationHandout();
    this.sortAndRender('vacation', 'vacationSelect');
  }

  getVacationHandout(){
    return getVacationHandout()
      .then(rep=>{
        if (rep.length === 0) rep.push(false);

        this.problemsCalendar = rep;

        this.render('problemsCalendar', 'problemsCalendarHandout');
      })
      .catch(err=>console.log(err));
  }
}