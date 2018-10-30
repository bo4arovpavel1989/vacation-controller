'use strict'

const {compare, getObjectData, FormsHandler, getDayInMonth, getMiddleMonthes} = require('./helpers');
const Handlebars = require('./libs/h.min');

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

      if(month === 12)
        currentYear++;
    })

  }

  prepareGraphData(data){
    this.prepareCalendar();
    const {dates} = this.graphData.calendar;
    const sortedData = data.sort(compare('person', this.personSort));

    sortedData.forEach((datum, i)=>{
      this.graphData.persons.push({person:datum.person, daysoff:[]});

      dates.forEach(date=>{
        const currentDate = Date.parse(`${date.year}-${date.month}-${date.date}`);
        const dateFrom = Date.parse(datum.dateFrom);
        const dateTo = Date.parse(datum.dateTo);

        if(currentDate >= dateFrom && currentDate < dateTo)
          this.graphData.persons[i].daysoff.push(true)
        else
          this.graphData.persons[i].daysoff.push(false)
      })

    });

    this.render('graphData')
  }

  render(data){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(`${data}Select`).innerHTML = html;
  }
}
