'use strict';

const {getPage} = require('./config');
const ObjectManagment = require('./objectManagment');
const VacationManagment = require('./vacationManagment');
const Infotable = require('./infotable');
const EmployeManagment = require('./employeManagment');
let pageScript;

switch(getPage()) {
  case 'objectManagment':
    pageScript = new ObjectManagment({
      formsSelector: '.objectManagmentForm'
    });
    break;
  case 'vacationManagment':
    pageScript = new VacationManagment({
      formsSelector: '.vacationManagmentForm'
    });
    break;
  case 'infotable':
    pageScript = new Infotable({
      formsSelector: '.filterManagmentForm'
    });
    break;
  case 'employeManagment':
    pageScript = new EmployeManagment({
      formsSelector: '.employeManagmentForm'
    });
    break;
  default:
    pageScript = null;
}
