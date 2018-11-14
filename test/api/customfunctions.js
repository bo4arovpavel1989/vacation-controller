const  {describe, it} = require('mocha'),
  {expect} = require('chai'),
  customFunctions = require('../../api/customfunctions'),
  corrects = require('./corrects');
    
describe('calculateVacationEnd', ()=>{
  it('Should calculate dateTo prop of vacation object', ()=>{
		const req = {
				body: {
					dateFrom:'2018-12-15',
					long:28
				}
			},
			{calculateVacationEnd} = customFunctions,
			result = calculateVacationEnd(req);
			
		expect(req.body.dateTo).to.eql(Date.parse('2019-01-12'));
		expect(result).to.eql(true);	
  });
}); 
    
describe('getFullDates', ()=>{
  it('Should calculate dates from and to', ()=>{
	const body = {monthFrom:'12',yearFrom:'2018',monthTo:'02',yearTo:'2019'},
		{getFullDates} = customFunctions,
		result = getFullDates(body);
	
	expect(result).to.eql(['2018-12-01', '2019-03-01'])
  });
}); 
   
describe('getOrQuery', ()=>{
  it('Should generate $or query for mongo', ()=>{
	const body = {
			shifts:['shift1', 'shift2', 'shift3'], 
			positions:['position1', 'position2']
		},
		{getOrQuery} = customFunctions,
		{orQueryCorrects} = corrects,
		result = getOrQuery(body);
	
	expect(result).to.eql(orQueryCorrects)
  });
});  
 
describe('getNamesQuery', ()=>{
  it('Should get names array from array of mongo objects', ()=>{
	const objectsArray = [
			{person: 'person1', shift:'shift1', position:'position1'},
			{person: 'person2', shift:'shift1', position:'position2'},
			{person: 'person3', shift:'shift2', position:'position1'}
		],
		{getNamesQuery} = customFunctions,
		result = getNamesQuery(objectsArray);
		
	expect(result).to.eql([
				{person: 'person1'},
				{person: 'person2'},
				{person: 'person3'}
			])	
  });
});