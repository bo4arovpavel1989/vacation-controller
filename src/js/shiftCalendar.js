'use strict'

const PageScript = require('./PageScript');

module.exports = class ShiftCalendar extends PageScript{
  constructor(selectors){
    super(selectors);


  }

  setListeners(){
    this.formsHandler.ee.on('refreshRender', ()=>{});
  }
}
