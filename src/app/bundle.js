(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports.API_URL = 'http://localhost:8080';

module.exports.getPage = function() {
  let idElement = document.getElementById('pageId');
  
  return idElement.dataset.id;
}

},{}],2:[function(require,module,exports){
'use strict'

module.exports = class EmployeManagment {
  constructor(){

  }



}

},{}],3:[function(require,module,exports){
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

},{"./config":1,"./employeManagment":2,"./infotable":4,"./objectManagment":5,"./vacationManagment":6}],4:[function(require,module,exports){
'use strict'

module.exports = class Infotable {
  constructor(){

  }

}

},{}],5:[function(require,module,exports){
'use strict'

module.exports = class ObjectManagent {
  constructor(){
    this.isPopup = false;
    this.listeners();
  }

  listeners(){
    document
      .getElementById('addShift')
      .addEventListener('click', (e)=>this.addShiftForm(e));
    document
      .getElementById('container')
      .addEventListener('click', (e)=>this.closePopup(e));
    document
      .getElementById('shiftAddForm')
      .addEventListener('submit', (e)=>this.shiftFormhandler(e));
  }

  addShiftForm(e){
    e.stopPropagation();
    let el = document.getElementById('shiftAddFormArea');

    this.isPopup = true;
    el.classList.add('popedUp');
  }

  closePopup(e){
    e.stopPropagation();
    if(this.isPopup) {
      let popups = document.querySelectorAll('.popup');

      this.isPopup = false;
      popups.forEach(p=>{
        p.classList.remove('popedUp');
      })
    }
  }

  shiftFormhandler(e){
    e.preventDefault();

    
  }

}

},{}],6:[function(require,module,exports){
'use strict'

module.exports = class VacationManagment {
  constructor(){

  }

}

},{}]},{},[3]);
