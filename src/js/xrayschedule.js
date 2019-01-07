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


    console.log(rep);
    this.render('calendar', 'calendarArea');
    this.render('shift', 'shiftArea');
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.setCalendar);
  }
}
