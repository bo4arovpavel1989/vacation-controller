
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

module.exports.guardList = [
	{person:'Carl1',position:'Guard',shift:'Суточная 1'},
	{person:'Carl2',position:'Guard',shift:'Суточная 2'},
	{person:'Carl3',position:'Guard',shift:'Суточная 3'},
	{person:'Carl4',position:'Guard',shift:'Суточная 4'},
	{person:'Carl5',position:'Guard',shift:'Оперативная 1'},
	{person:'Carl6',position:'Guard',shift:'Оперативная 2'}
];

module.exports.medicList = [
	{person:'Adam1',position:'Medic',shift:'Суточная 1'},
	{person:'Bob1',position:'Medic',shift:'Суточная 1'},
	{person:'Adam2',position:'Medic',shift:'Суточная 2'},
	{person:'Bob2',position:'Medic',shift:'Суточная 2'},
	{person:'Adam3',position:'Medic',shift:'Суточная 3'},
	{person:'Bob3',position:'Medic',shift:'Суточная 3'},
	{person:'Adam4',position:'Medic',shift:'Суточная 4'},
	{person:'Bob4',position:'Medic',shift:'Суточная 4'},
	{person:'Adam5',position:'Medic',shift:'Оперативная 1'},
	{person:'Bob5',position:'Medic',shift:'Оперативная 1'},
	{person:'Adam6',position:'Medic',shift:'Оперативная 2'},
	{person:'Bob6',position:'Medic',shift:'Оперативная 2'}

];

module.exports.positions = [
	{position:'Medic', totalQuantity:8,shiftQuantity:3},
	{position:'Guard', totalQuantity:6,shiftQuantity:3}
]

module.exports.vacations = [
	{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
];

module.exports.vacationCalendar = [
	{
		date:new Date('2019-01-01'),
		vacations:[
			{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
		]
	},
	{
		date:new Date('2019-01-02'),
		vacations:[
			{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
		]
	},
	{
		date:new Date('2019-01-03'),
		vacations:[
			{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
		]
	},
	{
		date:new Date('2019-01-04'),
		vacations:[
			{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
		]
	},
	{
		date:new Date('2019-01-05'),
		vacations:[
			{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
		]
	},
	{
		date:new Date('2019-01-06'),
		vacations:[
			{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
		]
	},
	{
		date:new Date('2019-01-07'),
		vacations:[
			{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
		]
	}
];

module.exports.personsByShift = {
	'Суточная 1': [{person:'Adam1',position:'Medic',shift:'Суточная 1'},
		{person:'Bob1',position:'Medic',shift:'Суточная 1'},
		{person:'Carl1',position:'Guard',shift:'Суточная 1'}
	],
	'Суточная 2': [{person:'Adam2',position:'Medic',shift:'Суточная 2'},
		{person:'Bob2',position:'Medic',shift:'Суточная 2'},
		{person:'Carl2',position:'Guard',shift:'Суточная 2'}
	],
	'Суточная 3': [{person:'Adam3',position:'Medic',shift:'Суточная 3'},
		{person:'Bob3',position:'Medic',shift:'Суточная 3'},
		{person:'Carl3',position:'Guard',shift:'Суточная 3'}
	],
	'Суточная 4': [{person:'Adam4',position:'Medic',shift:'Суточная 4'},
		{person:'Bob4',position:'Medic',shift:'Суточная 4'},
		{person:'Carl4',position:'Guard',shift:'Суточная 4'}
	],
	'Оперативная 1': [{person:'Adam5',position:'Medic',shift:'Оперативная 1'},
		{person:'Bob5',position:'Medic',shift:'Оперативная 1'},
		{person:'Carl5',position:'Guard',shift:'Оперативная 1'}
	],
	'Оперативная 2': [{person:'Adam6',position:'Medic',shift:'Оперативная 2'},
		{person:'Bob6',position:'Medic',shift:'Оперативная 2'},
		{person:'Carl6',position:'Guard',shift:'Оперативная 2'}
	],
};

module.exports.dutyPersons = {
				Medic:[
					{person:'Bob4',position:'Medic',shift:'Суточная 4'},
					{person:'Adam6',position:'Medic',shift:'Оперативная 2'},
					{person:'Bob6',position:'Medic',shift:'Оперативная 2'}
				],
				Guard:[
					{person:'Carl4',position:'Guard',shift:'Суточная 4'},
					{person:'Carl6',position:'Guard',shift:'Оперативная 2'}
				]
			};

module.exports.shiftProblem = [{
	shift:['Суточная 4', 'Оперативная 2'],
	position:'Guard'
}];
