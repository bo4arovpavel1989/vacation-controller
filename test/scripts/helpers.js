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
		const {prepareCalendar} = helpers;
		const monthes = [{month:'12'},{month:'01'}];
		let yFrom = 2018;
		let result = prepareCalendar(yFrom, monthes);
		
		expect(result).to.eql([
			{date:'01',month:'12',year:2018},
			{date:'02',month:'12',year:2018},
			{date:'03',month:'12',year:2018},
			{date:'04',month:'12',year:2018},
			{date:'05',month:'12',year:2018},
			{date:'06',month:'12',year:2018},
			{date:'07',month:'12',year:2018},
			{date:'08',month:'12',year:2018},
			{date:'09',month:'12',year:2018},
			{date:'10',month:'12',year:2018},
			{date:'11',month:'12',year:2018},
			{date:'12',month:'12',year:2018},
			{date:'13',month:'12',year:2018},
			{date:'14',month:'12',year:2018},
			{date:'15',month:'12',year:2018},
			{date:'16',month:'12',year:2018},
			{date:'17',month:'12',year:2018},
			{date:'18',month:'12',year:2018},
			{date:'19',month:'12',year:2018},
			{date:'20',month:'12',year:2018},
			{date:'21',month:'12',year:2018},
			{date:'22',month:'12',year:2018},
			{date:'23',month:'12',year:2018},
			{date:'24',month:'12',year:2018},
			{date:'25',month:'12',year:2018},
			{date:'26',month:'12',year:2018},
			{date:'27',month:'12',year:2018},
			{date:'28',month:'12',year:2018},
			{date:'29',month:'12',year:2018},
			{date:'30',month:'12',year:2018},
			{date:'31',month:'12',year:2018},
			{date:'01',month:'01',year:2019},
			{date:'02',month:'01',year:2019},
			{date:'03',month:'01',year:2019},
			{date:'04',month:'01',year:2019},
			{date:'05',month:'01',year:2019},
			{date:'06',month:'01',year:2019},
			{date:'07',month:'01',year:2019},
			{date:'08',month:'01',year:2019},
			{date:'09',month:'01',year:2019},
			{date:'10',month:'01',year:2019},
			{date:'11',month:'01',year:2019},
			{date:'12',month:'01',year:2019},
			{date:'13',month:'01',year:2019},
			{date:'14',month:'01',year:2019},
			{date:'15',month:'01',year:2019},
			{date:'16',month:'01',year:2019},
			{date:'17',month:'01',year:2019},
			{date:'18',month:'01',year:2019},
			{date:'19',month:'01',year:2019},
			{date:'20',month:'01',year:2019},
			{date:'21',month:'01',year:2019},
			{date:'22',month:'01',year:2019},
			{date:'23',month:'01',year:2019},
			{date:'24',month:'01',year:2019},
			{date:'25',month:'01',year:2019},
			{date:'26',month:'01',year:2019},
			{date:'27',month:'01',year:2019},
			{date:'28',month:'01',year:2019},
			{date:'29',month:'01',year:2019},
			{date:'30',month:'01',year:2019},
			{date:'31',month:'01',year:2019},
		]);
	 });
 }); 

describe('preparePersons', ()=>{
	it('Should return array of person vacation data for render', ()=>{
		const sortedData = [{person:'APerson', _id:'id', dateFrom:'2018-12-01', dateTo:'2018-12-15', long:14},
			{person:'BPerson', _id:'id2',  dateFrom:'2018-12-14', dateTo:'2019-01-14', long:31}];
		const dates = [
			{date:'01',month:'12',year:2018},
			{date:'02',month:'12',year:2018},
			{date:'03',month:'12',year:2018},
			{date:'04',month:'12',year:2018},
			{date:'05',month:'12',year:2018},
			{date:'06',month:'12',year:2018},
			{date:'07',month:'12',year:2018},
			{date:'08',month:'12',year:2018},
			{date:'09',month:'12',year:2018},
			{date:'10',month:'12',year:2018},
			{date:'11',month:'12',year:2018},
			{date:'12',month:'12',year:2018},
			{date:'13',month:'12',year:2018},
			{date:'14',month:'12',year:2018},
			{date:'15',month:'12',year:2018},
			{date:'16',month:'12',year:2018},
			{date:'17',month:'12',year:2018},
			{date:'18',month:'12',year:2018},
			{date:'19',month:'12',year:2018},
			{date:'20',month:'12',year:2018},
			{date:'21',month:'12',year:2018},
			{date:'22',month:'12',year:2018},
			{date:'23',month:'12',year:2018},
			{date:'24',month:'12',year:2018},
			{date:'25',month:'12',year:2018},
			{date:'26',month:'12',year:2018},
			{date:'27',month:'12',year:2018},
			{date:'28',month:'12',year:2018},
			{date:'29',month:'12',year:2018},
			{date:'30',month:'12',year:2018},
			{date:'31',month:'12',year:2018}];
		const {preparePersons} = helpers;
		const result = preparePersons(sortedData, dates);
		
		expect(result).to.eql([
			{person:'APerson', daysOff:[
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:true, _id:'id'},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false}
			]},
			{person:'BPerson', daysOff:[
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:false},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
				{is:true, _id:'id2'},
			]}
		])
  });
});