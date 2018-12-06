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

describe('getVacationCalendar', ()=>{
	before(()=>{
		spyDateNow = sinon.stub(Date, 'now');
	});

	after(()=>{
		spyDateNow.restore();
	});

	it('Should get array of dates with vacations', ()=>{
		const {getVacationCalendar} = customFunctions,
			{vacationCalendar} = corrects,
			{vacations} = corrects,
			dateTo = '2019-01-10',
			dateFrom = '2019-01-01',
			day = 24 * 60 * 60 * 1000;

		spyDateNow.returns(Date.parse(dateFrom));

		let currentDate = Date.parse(dateFrom);

		while(currentDate < Date.parse(dateTo)) {
			// We assume that there is Adam4 who is on vacation by that date
			if(currentDate <= Date.parse('2019-01-07'))
				spyFind.withArgs('Vacation', {dateFrom: {$lte: currentDate}, dateTo: {$gt: currentDate}}).resolves(vacations);
			else
				spyFind.withArgs('Vacation', {dateFrom: {$lte: currentDate}, dateTo: {$gt: currentDate}}).resolves([]);

			currentDate += day;
		}

		return getVacationCalendar(dateTo).then(result=>{
			expect(result).to.deep.equal(vacationCalendar)
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
				{person:'Carl1', dateFrom:'2018-12-01', dateTo:'2019-01-15'},
				{person:'Carl2', dateFrom:'2018-12-15', dateTo:'2019-01-15'}
			]},
			{guardList, medicList, positions} = corrects,
			{checkTotalPositionsQuantity} = customFunctions;

		spyFind
			.withArgs('Person', {position:'Guard'}).resolves(guardList)
			.withArgs('Person', {position:'Medic'}).resolves(medicList);

		return checkTotalPositionsQuantity(calendarDate, positions).then(result=>{
			// We assume that there are not enought of Guards
			expect(result).to.deep.equal(['Guard']);
		});
	});
});

describe('checkIfPersonOnVacation', ()=>{
	it('Returns true if person is on vacation', ()=>{
		const person = 'John',
			vacationDate = corrects.vacationCalendar[0],
			{checkIfPersonOnVacation} = customFunctions,
			result = checkIfPersonOnVacation(person, vacationDate);
		
			expect(result).to.equal(true);
	});
});

describe('getPersonsByShift', ()=>{
	it('Returns object of employes by their shifts', ()=>{
		const {getPersonsByShift} = customFunctions,
			{shiftsFromDb} = corrects,
			{personsByShift} = corrects;
			
		for (let shift in personsByShift){
			spyFind.withArgs('Person',{shift}).resolves(personsByShift[shift])
		}

		return getPersonsByShift(shiftsFromDb).then(result=>{
			expect(result).to.eql(personsByShift);
		});

	});
});

describe('getDutyPersons', ()=>{
	it('Returns object with persons on duty by their positions', ()=>{
		const {personsByShift} = corrects,
			{getDutyPersons} = customFunctions,
			{shiftsFromDb} = corrects,
			{positions} = corrects,
			{dutyPersons} = corrects,
			date = '2019-01-01';

		spyFind.resolves(shiftsFromDb);

		personsByShift['Суточная 4'].forEach(personObject=>{
			let {person} = personObject;
			let resolver;

			// We assume that Adam4 is on vacation that day
			if(person === 'Adam4') resolver = 1
			else resolver = 0;

			spyCount.withArgs('Vacation', sinon.match({person})).resolves(resolver);
		});

		personsByShift['Оперативная 2'].forEach(personObject=>{
			let {person} = personObject;
			// We assume that there is nobody at vacation on the shift
			spyCount.withArgs('Vacation', sinon.match({person})).resolves(0);
		});

		return 	getDutyPersons(personsByShift, date, positions).then(result=>{
			expect(result).to.deep.equal(dutyPersons);
		})
	});
});

describe('checkShiftPositionQuantity', ()=>{
	it('Returns object with persons on duty by their positions', ()=>{
		const {dutyPersons} = corrects,
			{positions} = corrects,
			{shiftProblem} = corrects,
			{checkShiftPositionQuantity} = customFunctions,
			result = checkShiftPositionQuantity(dutyPersons, positions);

		expect(result).to.deep.equal(shiftProblem);
	});
});

describe('checkVacationCalendar', ()=>{
	it('Returns problem calendar from vacationCalendar', ()=>{
		const {vacationCalendar} = corrects,
			{positions} = corrects,
			{checkVacationCalendar} = customFunctions
			{shiftsFromDb} = corrects,
			{personsByShift} = corrects;
			
		// Stubbing db queries in getPersonsByShift
		spyFind
			.withArgs('Shift').resolves(shiftsFromDb);

		for (let shift in personsByShift){
			spyFind.withArgs('Person',{shift}).resolves(personsByShift[shift])
		}	
		// Stubbed getPersonsByShift
		
		//Stubbing db queries in getDutyPersons
		
		// Stubbing db queries in getShiftOnDuty
		 /*already stubbed in getPersonsByShift*/
		// Stubbed getShiftOnDuty
		
		
		// stubbed getDutyPersons
	});
});
