'use strict'

const PageScript = require('./PageScript');

module.exports = class XraySchedule extends PageScript{
  constructor(selectors){
    super(selectors);

    this.shift = [];
    this.calendar = [];
    this.week = [
      'понедельник',
      'вторник',
      'среда',
      'четверг',
      'пятница',
      'суббота',
      'воскресенье'
    ]

    this.setCalendar = this.setCalendar.bind(this);
    this.setListeners();
  }

  setCalendar(rep){
    [this.calendar, this.shift] = rep;

    this.setColSpan('tableCol');
    this.render('calendar', 'calendarArea');
    this.render('shift', 'shiftArea');
  }

  setColSpan(selector){
    let spanLength = 0;

    this.shift.forEach(shiftPair=>{
      spanLength += shiftPair.length;
    });

    document.getElementById(selector).setAttribute('span', spanLength);
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.setCalendar);
  }
}
