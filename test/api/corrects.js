	
module.exports.orQueryCorrects = [
		{shift:'shift1', position:'position1'},
		{shift:'shift1', position:'position2'},
		{shift:'shift2', position:'position1'},
		{shift:'shift2', position:'position2'},
		{shift:'shift3', position:'position1'},
		{shift:'shift3', position:'position2'}
	];	
		
module.exports.editReq = {
	params: {type: 'Shift'},
	body: {_id: 'id', person: 'person'}
};