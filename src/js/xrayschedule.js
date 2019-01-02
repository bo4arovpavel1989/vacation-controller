'use strict'

const PageScript = require('./PageScript');
const {} = require('./helpers');

module.exports = class XraySchedule extends PageScript{
  constructor(selectors){
    super(selectors);

    this.setCalendar = this.setCalendar.bind(this);
    this.setListeners();
  }

  setCalendar(rep){
    console.log(rep)
  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.setCalendar);
  }
}
