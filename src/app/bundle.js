(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports.API_URL = 'http://localhost:8080';

module.exports.getPage = function() {
  let idElement = document.getElementById('pageId');
  
  return idElement.dataset.id;
}

},{}],2:[function(require,module,exports){
'use strict';

const {getPage} = require('./config');
const ObjectManagment = require('./objectManagment');
const VacationManagment = require('./objectManagment');
const Infotable = require('./objectManagment');
const EmployeManagment = require('./objectManagment');
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

},{"./config":1,"./objectManagment":3}],3:[function(require,module,exports){
'use strict'

module.exports = class ObjectManagent {
  constructor(){
    this.iAmAlive()
  }

  iAmAlive(){
    alert(111)
  }
}

},{}]},{},[2]);
