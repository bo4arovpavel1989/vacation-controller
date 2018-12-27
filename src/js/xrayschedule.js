'use strict'

const PageScript = require('./PageScript');
const {} = require('./helpers');

module.exports = class XraySchedule extends PageScript{
  constructor(selectors){
    super(selectors);

    this.setListeners();
  }


  setListeners(){
    this.formsHandler.ee.on('refreshRender', this.setCalendar);
  }
}
