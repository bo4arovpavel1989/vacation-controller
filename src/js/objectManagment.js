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
