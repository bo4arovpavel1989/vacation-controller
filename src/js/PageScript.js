'use strict'

const FormsHandler = require('./FormsHandler');
const Handlebars = require('./libs/h.min');
const {HandlebarsIntl} = require('./libs/h-intl.min');
const {compare, getObjectData, getEmployeData, getVacationData, selectElementContents} = require('./helpers');

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
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.setSort = this.setSort.bind(this);
    this.setSortValue = this.setSortValue.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);

    // Default sort
    this.sort = 'person';
    this.sortValue = 1;
    this.sortEl = document.getElementById('setSort');
    this.sortValEl = document.getElementById('sortValue');

    // Default clipboard copy button settings
    this.clipBoardButton = document.getElementById('clipboardCopy');

    this.setSortListeners();
    this.setClipboardCopyListener();
  }

  setSortListeners(){
    if(this.sortEl && this.sortValEl) {
      this.sortEl.addEventListener('change', this.setSort);
      this.sortValEl.addEventListener('click', this.setSortValue);
    }
  }

  setSort(){
      this.sort = this.sortEl.value;
      const dataAttr = this.sortEl.parentElement.dataset;

      this.sortAndRender(dataAttr.entry, dataAttr.area);
  }

  setSortValue(){
    const contentMap = {
        '1': '&uarr;',
        '-1': '&darr;'
      };

    const dataAttr = this.sortValEl.parentElement.dataset;

    this.sortValue *= -1;
    const stringSortValue = this.sortValue.toString();

    this.sortValEl.innerHTML = contentMap[stringSortValue];
    this.sortAndRender(dataAttr.entry, dataAttr.area);
  }

  setClipboardCopyListener(){
    if(this.clipBoardButton) {
      this.clipBoardButton.addEventListener('click', this.copyToClipboard)
    }
  }

  copyToClipboard(){
    const copyArea = this.clipBoardButton.dataset.target;

    selectElementContents(document.getElementById(copyArea));
    document.execCommand('copy');
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

  sortAndRender(entry, selector){

    this[entry] = this[entry].sort(compare(this.sort, this.sortValue));
    this.render(entry, selector);
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