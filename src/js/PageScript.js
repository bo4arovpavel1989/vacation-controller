'use strict'

const FormsHandler = require('./FormsHandler');
const Handlebars = require('./libs/h.min');
const {HandlebarsIntl} = require('./libs/h-intl.min');
const {compare, getObjectData, getEmployeData, getVacationData} = require('./helpers');

HandlebarsIntl.registerWith(Handlebars);

/**
* Class made to handle standart page behavior:
* getting data from API and rendering it
*/
module.exports = class PageScript {
  constructor(selectors){
    this.formsHandler = new FormsHandler(selectors);
    this.getObjectData = this.getObjectData.bind(this);
    this.getEmployeData = this.getEmployeData.bind(this);
    this.getVacationData = this.getVacationData.bind(this);
    this.handleObjectData = this.handleObjectData.bind(this);
    this.handleEmployeData = this.handleEmployeData.bind(this);
    this.handleVacationData = this.handleVacationData.bind(this);
  }

  sortAndRender(entry, selector){
    this[entry] = this[entry].sort(compare(entry, this[`${entry}Sort`]));
    this.render(entry, selector);
  }

  getObjectData(){
    return getObjectData()
      .then(this.handleObjectData)
      .catch(err=>console.log(err));
  }

  getEmployeData(){
    return getEmployeData()
      .then(this.handleEmployeData)
      .catch(err=>console.log(err));
  }

  getVacationData(){
    return getVacationData()
      .then(this.handleVacationData)
      .catch(err=>console.log(err));
  }

  handleObjectData(){
    return null;
  }

  handleEmployeData(){
    return null;
  }

  handleVacationData(){
    return null;
  }

  render(data, selector){
    const source = document.getElementById(data).innerHTML;
    const template = Handlebars.compile(source);
    const context = this[data];
    const html = template(context);

    document.getElementById(selector).innerHTML = html;
    this.formsHandler.refreshListeners();
  }
}
