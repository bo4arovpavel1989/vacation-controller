'use strict'

const {compare,
  getObjectData,
  getMiddleMonthes,
  prepareCalendar,
  preparePersons,
  getFilterData,
  concatVacations,
  PageScript
} = require('./helpers');

const Handlebars = require('./libs/h.min');

module.exports = class EmployeManagment  extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shifts=[];
    this.positions=[];

    this.shiftSort = 1;
    this.positionSort = 1;
    this.personSort = 1;

    this.defaults = {
      title:'',
      dayWidth:20,
      calendar: {
        monthes:[],
        dates:[]
      },
      persons:[]
    };
    this.graphData=this.defaults;

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
    this.render(`${entry}s`, `${entry}sSelect`);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', data=>this.prepareGraphData(data));
  }

  clearGraphData(){
    this.graphData=this.defaults;
  }

  /**
   * Function sorts vacation data by name and
   * makes of array of dutyDays and daysOff
   * concats data and renders
   * @param {Array} data - data got from API
   * @returns {void}
   */
  prepareGraphData(data){
    this.clearGraphData();


    const {mFrom, mTo, yFrom, yTo} = getFilterData();
    const {dayWidth} = this.graphData;

    this.graphData.calendar.monthes = getMiddleMonthes(mFrom, yFrom, mTo, yTo, dayWidth);


    const {monthes} = this.graphData.calendar;

    this.graphData.calendar.dates = prepareCalendar(yFrom, monthes);


    const {dates} = this.graphData.calendar;
    const sortedData = data.sort(compare('person', this.personSort));
    const persons = preparePersons(sortedData, dates);

    this.graphData.persons = concatVacations(persons)


    this.graphData.title = `График отпусков ${mFrom}-${yFrom} - ${mTo}-${yTo}`;

    this.render('graphData', 'graphDataField');
  }
}
