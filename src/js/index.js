'use strict';

const {getPage} = require('./config');
const ObjectManagment = require('./objectManagment');
const VacationManagment = require('./vacationManagment');
const Infotable = require('./infotable');
const EmployeManagment = require('./employeManagment');
let pageScript;

switch(getPage()) {
  case 'objectManagment':
    pageScript = new ObjectManagment()
    break;
  case 'vacationManagment':
    pageScript = new VacationManagment()
    break;
  case 'infotable':
    pageScript = new Infotable();
    break;
  case 'employeManagment':
    pageScript = new EmployeManagment();
    break;
  default:
    pageScript = null;
}
