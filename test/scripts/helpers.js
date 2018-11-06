const  {describe, it} = require('mocha'),
  {expect} = require('chai'),
  helpers = require('../../src/js/helpers')

describe('getDayInMonth', ()=>{
  it('Should return quantity of days in month', ()=>{
		const {getDayInMonth} = helpers,
			result = getDayInMonth(2018, 04);
			
		expect(result).to.eql(30)	
  });
});

describe('getMonthName', ()=>{
  it('Should return string name of month', ()=>{
		const {getMonthName} = helpers,
			result = getMonthName(11);
			
		expect(result).to.eql('Ноябрь')	
  });
});

describe('getMiddleMonthes', ()=>{
  it('Should return monthes array as {month, dayInMonth, year, monthWidth,monthName}', ()=>{
		const {getMiddleMonthes} = helpers,
			result = getMiddleMonthes(02,2018,06,2018,20);
			
		expect(result).to.eql([
			{month:'02',dayInMonth:28,year:2018,monthWidth:20*28,monthName:'Февраль'},
			{month:'03',dayInMonth:31,year:2018,monthWidth:20*31,monthName:'Март'},
			{month:'04',dayInMonth:30,year:2018,monthWidth:20*30,monthName:'Апрель'},
			{month:'05',dayInMonth:31,year:2018,monthWidth:20*31,monthName:'Май'},
			{month:'06',dayInMonth:30,year:2018,monthWidth:20*30,monthName:'Июнь'}
		])	
  });
});

describe('getMiddleMonthes2', ()=>{
  it('Should return monthes array as {month, dayInMonth, year, monthWidth,monthName}', ()=>{
		const {getMiddleMonthes} = helpers,
			result = getMiddleMonthes(11,2018,02,2019,20);
			
		expect(result).to.eql([
			{month:'11',dayInMonth:30,year:2018,monthWidth:20*30,monthName:'Ноябрь'},
			{month:'12',dayInMonth:31,year:2018,monthWidth:20*31,monthName:'Декабрь'},
			{month:'01',dayInMonth:31,year:2019,monthWidth:20*31,monthName:'Январь'},
			{month:'02',dayInMonth:28,year:2019,monthWidth:20*28,monthName:'Февраль'}
		])	
  });
});