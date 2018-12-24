'use strict'

const PageScript = require('./PageScript');

module.exports = class ShiftCalendar extends PageScript{
  constructor(selectors){
    super(selectors);

    this.calendar = [];
    this.shift = [];

    this.setCalendar = this.setCalendar.bind(this);
    this.getObjectData();
    this.setListeners();
  }

  setCalendar(rep){
    this.calendar = rep;

    this.render('calendar', 'calendarArea')
    this.prepareGraphData();
  }

  prepareGraphData(){
    this.prepareShifts();
    this.fillDutyArray();
  }

  prepareShifts(){
    this.shift.forEach(shift=>{
      shift.dutyArray = [];
    });
  }

  fillDutyArray(){
    this.calendar.forEach(date=>{
      this.shift.forEach(shiftObj=>{
        let {shift} = shiftObj;

        if(date.shift.includes(shift)) shiftObj.dutyArray.push(true);
        else shiftObj.dutyArray.push(false);
      });
    });

    console.log(this.shift)
  }

  handleObjectData(rep){
    [this.shift] = rep;
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.setCalendar);
  }
}
