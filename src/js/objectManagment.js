'use strict'
const {getForm, postData} = require('./helpers');

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
    const el = document.getElementById('shiftAddFormArea');

    this.isPopup = true;
    el.classList.add('popedUp');
  }

  closePopup(e){
    e.stopPropagation();
    if(this.isPopup) {
      const popups = document.querySelectorAll('.popup');

      this.isPopup = false;
      popups.forEach(p=>{
        p.classList.remove('popedUp');
      })
    }
  }

  shiftFormhandler(e){
    e.preventDefault();

    postData('addshift', getForm(e.target))
      .then(()=>this.closePopup())
      .catch(err=>console.log(err))
  }

}
