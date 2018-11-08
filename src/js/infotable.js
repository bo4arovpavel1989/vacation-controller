'use strict'

const {compare,
  getObjectData,
  FormsHandler,
  getMiddleMonthes,
  getAllIndexes,
  prepareCalendar,
  preparePersons,
  getFilterData
} = require('./helpers');

const Handlebars = require('./libs/h.min');

// Filesaver needed to tableexport work
require('./libs/FileSaver.min');
const TableExport = require('./libs/tableexport.min');

module.exports = class EmployeManagment {
  constructor(){
    this.shifts=[];
    this.positions=[];
    this.shiftSort = 1;
    this.positionSort = 1;
    this.personSort = 1;
    this.graphData={
      title:'',
      dayWidth:20,
      calendar: {
        monthes:[],
        dates:[]
      },
      persons:[]
    };

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

  TableExport(){
      return TableExport;
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', data=>this.prepareGraphData(data));
  }

  clearGraphData(){
    this.graphData={
      title:'',
      dayWidth:20,
      calendar: {
        monthes:[],
        dates:[]
      },
      persons:[]
    };
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

      this.graphData.persons = preparePersons(sortedData, dates);

      this.concatVacations();

      this.graphData.title = `График отпусков ${mFrom}-${yFrom} - ${mTo}-${yTo}`;

      this.render('graphData');
      this.TableExport()(document.getElementsByTagName("table"));
    }

  /**
   * Method concats different vacation of single person
   * To render all vacations of single man in one line
   * @returns {void}
   */
  concatVacations(){
    const personSet = [];
    const notConcatedArray = this.graphData.persons;
    const resultArray = [];
    let occassions = [];

    notConcatedArray.forEach(person=>{
      personSet.push(person.person);
    });

    notConcatedArray.forEach((person, i)=>{
      const matches = personSet.filter(personInSet=>personInSet === person.person);

      // If person runs into only once
      if(matches.length === 1)
        resultArray.push(notConcatedArray[i])
      // If person has several vacations and all his occassions havent been calculated yet
      else if(occassions.indexOf(i) === -1){
        occassions = getAllIndexes(personSet, person.person)
        resultArray.push(this.concatVacationsOfSinglePerson(occassions, person.person))
      }
    });

    this.graphData.persons = resultArray;
  }

  concatVacationsOfSinglePerson(indexes, person){
    const firstOccassion = this.graphData.persons[indexes[0]];
    const {daysOff} = firstOccassion;

    // Start from 1 - coz i already performed first occassion
    for (let i = 1; i < indexes.length; i++) {
      this.graphData.persons[indexes[i]].daysOff.forEach((dayOff, k)=>{
        if(dayOff.is){
          daysOff[k].is = true;
          daysOff[k]._id = dayOff._id;
        }
      })
    }

    return {person, daysOff}
  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(`${data}Select`).innerHTML = html;
  }
}
