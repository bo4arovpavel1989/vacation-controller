'use strict'

const PageScript = require('./PageScript');
const {compare,
  getMiddleMonthes,
  prepareCalendar,
  preparePersons,
  getFilterData,
  concatVacations
} = require('./helpers');

module.exports = class ShiftCalendar extends PageScript{
  constructor(selectors){
    super(selectors);

    this.calendar = [];
    this.shift = [];

    this.sort = 'shift';

    this.defaults = {
      title:'',
      dayWidth:20,
      calendar: {
        monthes:[],
        dates:[]
      }
    };

    this.graphData=this.defaults;

    this.setCalendar = this.setCalendar.bind(this);
    this.getObjectData();
    this.setListeners();
  }

  setCalendar(rep){
    this.calendar = rep;

    this.prepareGraphData();
  }

  clearGraphData(){
    this.graphData=this.defaults;
  }

  prepareGraphData(){
    this.prepareHeadRow();
    this.prepareShifts();
    this.fillDutyArray();

    this.render('graphData', 'calendarArea');
    this.render('shift', 'shiftCalendar');
  }

  prepareHeadRow(){
    this.clearGraphData();

    const {mFrom, mTo, yFrom, yTo} = getFilterData();
    const {dayWidth} = this.graphData;

    this.graphData.calendar.monthes = getMiddleMonthes(mFrom, yFrom, mTo, yTo, dayWidth);

    const {monthes} = this.graphData.calendar;

    this.graphData.calendar.dates = prepareCalendar(yFrom, monthes);

    this.graphData.title = `Расписание дежурств ${mFrom}-${yFrom} - ${mTo}-${yTo}`;
  }

  prepareShifts(){
    this.shift.forEach(shift=>{
      shift.dutyArray = [];
    });
  }

  fillDutyArray(){
    this.calendar.forEach(date=>{
      this.shift.forEach(shiftObj=>{
        const {shift} = shiftObj;

        if(date.shift.includes(shift)) shiftObj.dutyArray.push(true);
        else shiftObj.dutyArray.push(false);

        shiftObj.dayWidth = this.graphData.dayWidth;
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