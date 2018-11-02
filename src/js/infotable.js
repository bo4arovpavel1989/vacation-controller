'use strict'

const {compare, getObjectData, FormsHandler, getDayInMonth, getMiddleMonthes, getAllIndexes} = require('./helpers');
const Handlebars = require('./libs/h.min');
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

  prepareCalendar(){
    const mFrom = document.getElementsByName('monthFrom')[0].value;
    const mTo = document.getElementsByName('monthTo')[0].value;
    const yFrom = document.getElementsByName('yearFrom')[0].value;
    const yTo = document.getElementsByName('yearTo')[0].value;
    const {dayWidth} = this.graphData;

    this.clearGraphData();
    this.graphData.title = `График отпусков ${mFrom}-${yFrom} - ${mTo}-${yTo}`;
    this.graphData.calendar.monthes = getMiddleMonthes(mFrom, yFrom, mTo, yTo, dayWidth);

    let currentYear = Number(yFrom);

    this.graphData.calendar.monthes.forEach(month=>{
      const monthLength = getDayInMonth(currentYear, month.month);

      for (let i = 1; i <= monthLength; i++) {
          this.graphData.calendar.dates.push({date:i, month:month.month, year: currentYear})
      }

      if(month.month === '12')
        currentYear++;
    })

  }

  prepareGraphData(data){
    this.prepareCalendar();
    const {dates} = this.graphData.calendar;
    const sortedData = data.sort(compare('person', this.personSort));

    sortedData.forEach((datum, i)=>{
      this.graphData.persons.push({person:datum.person, daysOff:[]});

      dates.forEach(date=>{
        const currentDate = Date.parse(`${date.year}-${date.month}-${date.date}`);
        const dateFrom = Date.parse(datum.dateFrom);
        const dateTo = Date.parse(datum.dateTo);

        if(currentDate >= dateFrom && currentDate < dateTo)
          this.graphData.persons[i].daysOff.push({is:true, _id:datum._id})
        else
          this.graphData.persons[i].daysOff.push({is:false})
      })

    });

    this.concatVacations()

    this.render('graphData');
    new TableExport(document.getElementsByTagName("table"));
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
      // If person has several vacations
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
