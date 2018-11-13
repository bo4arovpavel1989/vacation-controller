const  {describe, it} = require('mocha'),
  {expect} = require('chai'),
  customFunctions = require('../../api/customfunctions');
    
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