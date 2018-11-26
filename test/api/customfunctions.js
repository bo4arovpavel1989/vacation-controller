const  {describe, it} = require('mocha'),
	chai = require('chai'),
	{expect} = chai,
	sinon = require("sinon"),
	sinonChai = require("sinon-chai"),
	customFunctions = require('../../api/customfunctions'),
	db = require('../../api/dbqueries'),
	corrects = require('./corrects');
  
chai.use(sinonChai);
    
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
 
describe('getDatesQuery', ()=>{
	it('Should get $or dates query for vacations', ()=>{
		const dates = ['2018-12-01', '2019-01-31'],
			{getDatesQuery} = customFunctions,
			result = getDatesQuery(dates);
		
		expect(result).to.eql([
			{dateFrom: {$lte: '2018-12-01'}, dateTo: {$gte: '2018-12-01'}},
			{dateFrom: {$gte: '2018-12-01', $lt: '2019-01-31'}}
		])	
	});
});
 
describe('editAllEmbeddedDocs', ()=>{
	it('Should make update query for Vacation doc when Person doc is edited', ()=>{
		const {editReq} = corrects,
			{editAllEmbeddedDocs} = customFunctions,
			spyFind = sinon.stub(db, "findOne").resolves({person: 'personOld'}),
			spyUpdate = sinon.stub(db, "update").resolves(true);	
				
		return editAllEmbeddedDocs(editReq).then(result=>{
			expect(result).to.equal(true);
			expect(spyFind).to.have.been.calledWith('Person', {_id: 'id'});
			expect(spyUpdate).to.have.been.calledWith('Vacation', {person: 'personOld'}, {$set: {person: 'personNew'}});
		});
	
	});
});

 
describe('getShiftOnDuty', ()=>{
	it('Should get dutyshift for certain day', ()=>{
		const day = '2019-01-01',
			{shiftsFromDb} = corrects,
			{getShiftOnDuty} = customFunctions,
			spyFind = sinon.stub(db, 'find').resolves(shiftsFromDb)
		
		return getShiftOnDuty('2019-01-01').then(result=>{
			expect(result).to.deep.equal([
				{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30'},
				{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26'}
			])
		});
	});
});