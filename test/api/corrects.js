	
module.exports.orQueryCorrects = [
		{shift:'shift1', position:'position1'},
		{shift:'shift1', position:'position2'},
		{shift:'shift2', position:'position1'},
		{shift:'shift2', position:'position2'},
		{shift:'shift3', position:'position1'},
		{shift:'shift3', position:'position2'}
	];	
		
module.exports.editReq = {
	params: {type: 'Person'},
	body: {_id: 'id', person: 'personNew'}
};

module.exports.shiftsFromDb = [
	{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27'},
	{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28'},
	{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29'},
	{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30'},
	{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28'},
	{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26'}
];