const  {describe, it} = require('mocha'),
  {expect} = require('chai'),
  helpers = require('../../src/js/helpers'),
  corrects = require('./corrects');
  
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
  it('Should return monthes array as {month, dayInMonth, year, monthWidth,monthName} within the same year', ()=>{
		const {getMiddleMonthes} = helpers,
			result = getMiddleMonthes(02,2018,06,2018,20),
			{getMiddleMonthesCorrects} = corrects;
			
		expect(result).to.eql(getMiddleMonthesCorrects)	
  });
});

describe('getMiddleMonthes2', ()=>{
  it('Should return monthes array as {month, dayInMonth, year, monthWidth,monthName} for different years', ()=>{
		const {getMiddleMonthes} = helpers,
			result = getMiddleMonthes(11,2018,02,2019,20),
			{getMiddleMonthes2Corrects} = corrects;
			
		expect(result).to.eql(getMiddleMonthes2Corrects)	
  });
});

describe('getForm', ()=>{
	it('should return body object from form object', ()=>{
		const formObject = {
			0: {name:'text', type:'text', value:'text'},
			1: {name:'number', type:'number', value:'2'},
			2: {name:'date', type:'date', value:'2018-11-08'},
			3: {name:'checkbox', type:'checkbox', value:'1', checked:true},
			4: {name:'checkbox', type:'checkbox', value:'2', checked:false},
			5: {name:'checkbox', type:'checkbox', value:'3', checked:true},
			6: {name:'submit', type:'submit', value:'submit'}
		};
		const {getForm} = helpers,
			result = getForm(formObject);
			
		expect(result).to.eql({
			checkbox:['1','3'],
			date:'2018-11-08',
			number:'2',
			text:'text'
		})	
	});
}); 

 describe('prepareCalendar', ()=>{
	 it('should return full calendar based on From and To dates', ()=>{
		const {prepareCalendar} = helpers,
			monthes = [{month:'12'},{month:'01'}],
			{prepareCalendarCorrects} = corrects;
		let yFrom = 2018;
		let result = prepareCalendar(yFrom, monthes);
		
		expect(result).to.eql(prepareCalendarCorrects);
	 });
 }); 

describe('preparePersons', ()=>{
	it('Should return array of person vacation data for render', ()=>{
		const sortedData = [
			{person:'APerson', _id:'id', dateFrom:'2018-12-01', dateTo:'2018-12-15', long:14},
			{person:'BPerson', _id:'id2',  dateFrom:'2018-12-14', dateTo:'2019-01-14', long:31}
		],
			{preparePersonsParamDates} = corrects,
			{preparePersons} = helpers,
			{preparePersonsCorrects} = corrects,
			result = preparePersons(sortedData, preparePersonsParamDates);
		
		expect(result).to.eql(preparePersonsCorrects)
  });
});