const  {describe, it} = require('mocha'),
	chai = require('chai'),
	{expect} = chai,
	sinon = require("sinon"),
	sinonChai = require("sinon-chai"),
	customFunctions = require('../../api/customfunctions'),
	db = require('../../api/dbqueries'),
	corrects = require('./corrects');
  
chai.use(sinonChai);

let spyFind, spyFindOne, spyUpdate;

beforeEach(()=>{
	spyFind = sinon.stub(db, 'find');
	spyFindOne = sinon.stub(db, "findOne");
	spyUpdate = sinon.stub(db, "update");
	spyCount = sinon.stub(db, 'count');
});

afterEach(()=>{
    spyFind.restore();
    spyFindOne.restore();
    spyUpdate.restore();
    spyCount.restore();
});
    
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
			{editAllEmbeddedDocs} = customFunctions;
			
		spyFindOne.resolves({person: 'personOld'});
		spyUpdate.resolves(true);	
				
		return editAllEmbeddedDocs(editReq).then(result=>{
			expect(result).to.equal(true);
			expect(spyFindOne).to.have.been.calledWith('Person', {_id: 'id'});
			expect(spyUpdate).to.have.been.calledWith('Vacation', {person: 'personOld'}, {$set: {person: 'personNew'}});
		});
	
	});
});

 
describe('getShiftOnDuty', ()=>{	
	it('Should get dutyshift for certain day', ()=>{
		const day = '2019-01-01',
			{shiftsFromDb} = corrects,
			{getShiftOnDuty} = customFunctions;
		
		spyFind.resolves(shiftsFromDb);
	
		return getShiftOnDuty('2019-01-01').then(result=>{
			expect(result).to.deep.equal([
				{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30'},
				{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26'}
			])
		});
	});
});

 
describe('checkTotalPositionsQuantity', ()=>{		
	it('Check if there are enought (at least threshold) of employes of each position', ()=>{
		const calendarDate = {date:'2019-01-01', vacations:[
				{person:'Abraham', dateFrom:'2018-12-01', dateTo:'2019-01-15'}, 
				{person:'Bob', dateFrom:'2018-12-15', dateTo:'2019-01-15'}, 
				{person:'Cortes', dateFrom:'2018-12-15', dateTo:'2019-01-02'}
			]},
			positions = [
				{position:'Guard', totalQuantity:2},
				{position:'Medic', totalQuantity:3}
			],
			{guardList, medicList} = corrects,
			{checkTotalPositionsQuantity} = customFunctions;	
			
		spyFind
			.withArgs('Person', {position:'Guard'}).resolves(guardList)
			.withArgs('Person', {position:'Medic'}).resolves(medicList);
			
		return checkTotalPositionsQuantity(calendarDate, positions).then(result=>{
			expect(result).to.deep.equal(['Medic']);
		});	
	});
});
 
describe('checkIfPersonOnVacation', ()=>{		
	it('Returns true if person is on vacation', ()=>{
		const person = 'John',
			date = '2019-02-01',
			{checkIfPersonOnVacation} = customFunctions;
			
		spyCount.resolves(1);
		
		return checkIfPersonOnVacation(person, date).then(result=>{
			expect(spyCount).to.have.been.calledWith('Vacation', {person, dateFrom:{$lte:date}, dateTo:{$gt: date}});
			expect(result).to.equal(true);
		});
	});
});

describe('getPersonsByShift', ()=>{		
	it('Returns object of employes by their shifts', ()=>{
		const {getPersonsByShift} = customFunctions;
		
		spyFind
			.withArgs('Shift').resolves([{shift:'s1'},{shift:'s2'},{shift:'s3'}])
			.withArgs('Person', {shift:'s1'}).resolves([{person:'Abraham'}, {person:'Bill'}])
			.withArgs('Person', {shift:'s2'}).resolves([{person:'Adam'}, {person:'Bob'}])
			.withArgs('Person', {shift:'s3'}).resolves([{person:'Alex'}, {person:'Betty'}]);
			
		
		return getPersonsByShift().then(result=>{
			expect(result).to.eql({
				s1:[{person:'Abraham'}, {person:'Bill'}],
				s2:[{person:'Adam'}, {person:'Bob'}],
				s3:[{person:'Alex'}, {person:'Betty'}]
			});	
		});
		
	});
});

describe('getDutyPersons', ()=>{		
	it('Returns object with persons on duty by their positions', ()=>{
		const {personsByShift} = corrects,
			{getDutyPersons} = customFunctions,
			{shiftsFromDb} = corrects,
			{positions} = corrects,
			date = '2019-01-01';
		
		spyFind.resolves(shiftsFromDb);
		
		spyCount
			.withArgs('Vacation', sinon.match({person:'Adam4'})).resolves(1)
			.withArgs('Vacation', sinon.match({person:'Bob4'})).resolves(0) 
			.withArgs('Vacation', sinon.match({person:'Adam6'})).resolves(0)
			.withArgs('Vacation', sinon.match({person:'Bob6'})).resolves(0) 
			.withArgs('Vacation', sinon.match({person:'Carl4'})).resolves(0) 
			.withArgs('Vacation', sinon.match({person:'Carl6'})).resolves(0);  
			
		return 	getDutyPersons(personsByShift, date, positions).then(result=>{
			expect(result).to.deep.equal({
				Medic:[
					{person:'Bob4',position:'Medic',shift:'Суточная 4'},
					{person:'Adam6',position:'Medic',shift:'Оперативная 2'},
					{person:'Bob6',position:'Medic',shift:'Оперативная 2'}
				],
				Guard:[
					{person:'Carl4',position:'Guard',shift:'Суточная 4'},
					{person:'Carl6',position:'Guard',shift:'Оперативная 2'}
				]
			});
		})
	});
});
