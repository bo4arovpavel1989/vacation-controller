
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

module.exports.shiftsFromDbToUpdate = [
	{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27', _id:'id1'},
	{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28', _id:'id2'},
	{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29', _id:'id3'},
	{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4'},
	{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5'},
	{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
];

module.exports.shiftsFromDbForMutualShifts = [
	{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27', _id:'id1'},
	{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28', _id:'id2'},
	{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29', _id:'id3'},
	{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4'},
	{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5'},
	{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
];

module.exports.shiftsFromDb = [
	{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27', _id:'id1'},
	{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28', _id:'id2'},
	{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29', _id:'id3'},
	{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4'},
	{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5'},
	{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
];

module.exports.dutyShifts = [
			{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4'},
			{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
		];

module.exports.refreshedDutyDates = [
Date.parse('2018-12-29'),
Date.parse('2018-12-30'),
Date.parse('2018-12-31'),
Date.parse('2018-12-28'),
Date.parse('2018-12-30'),
Date.parse('2018-12-28')
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
	{position:'Medic', totalQuantity:8,shiftQuantity:4},
	{position:'Guard', totalQuantity:6,shiftQuantity:2}
]

module.exports.namesQuery = [
	{person:'Adam1'},
	{person:'Adam2'},
	{person:'Adam3'},
	{person:'Adam4'}
];

// For concatPersonArrays test coz it modifies this array
module.exports.vacationsArray = [
	{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
];

// For getVacationCalendar test
module.exports.vacations = [
	{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7}
];

module.exports.concatedNamesVacationsArray = [
	{person:'Adam4', dateFrom:'2019-01-01', dateTo:'2019-01-08', long:7},
	{person:'Adam1'},
	{person:'Adam2'},
	{person:'Adam3'}
]

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
	position:'Medic'
}];

module.exports.problemsCalendar = [
	{
		date: new Date('2019-01-01'),
		shiftProblem:[{
			position:'Medic',
			shift:[
				'Суточная 4',
				'Оперативная 2'
			]
		}],
		totalProblem:[]
	},
	{
		date: new Date('2019-01-05'),
		shiftProblem:[{
			position:'Medic',
			shift:[
				'Суточная 4',
				'Оперативная 2'
			]
	}	],
		totalProblem:[]
	}
];

module.exports.dutyCalendar = [
	{date: new Date('2019-01-01'), shift:['Суточная 4', 'Оперативная 2']},
	{date: new Date('2019-01-02'), shift:['Суточная 1', 'Оперативная 2']},
	{date: new Date('2019-01-03'), shift:['Суточная 2', 'Оперативная 1']},
	{date: new Date('2019-01-04'), shift:['Суточная 3', 'Оперативная 1']},
];

module.exports.mutualShifts = [
	[
		{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4'},
		{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
	],
	[
		{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27', _id:'id1'},
		{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
	],
	[
		{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28', _id:'id2'},
		{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5'}
	],
	[
		{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29', _id:'id3'},
		{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5'}
	]
];

module.exports.mutualShiftsToCalculatePeriods = [
[
	{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4'},
	{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
],
[
	{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27', _id:'id1'},
	{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6'}
],
[
	{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28', _id:'id2'},
	{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5'}
],
[
	{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29', _id:'id3'},
	{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5'}
]
];

module.exports.mutualShiftsToCalculatePeriodsUpdated = [
	[
		{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4', periodTimes: 1},
		{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6', periodTimes: 2}
	],
	[
		{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27', _id:'id1', periodTimes: 1},
		{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6', periodTimes: 2}
	],
	[
		{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28', _id:'id2', periodTimes: 1},
		{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5', periodTimes: 2}
	],
	[
		{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29', _id:'id3', periodTimes: 1},
		{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5', periodTimes: 2}
	]
];

module.exports.mutualShiftsToCalculatePeriodsUpdated2 = [
	[
		{shift:'Суточная 4', duty:1, off:3, dutyDate:'2018-11-30', _id:'id4', periodTimes: 1, howMany: 2},
		{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6', periodTimes: 2, howMany: 3}
	],
	[
		{shift:'Суточная 1', duty:1, off:3, dutyDate:'2018-11-27', _id:'id1', periodTimes: 1, howMany: 2},
		{shift:'Оперативная 2', duty:2, off:2, dutyDate:'2018-11-26', _id:'id6', periodTimes: 2, howMany: 3}
	],
	[
		{shift:'Суточная 2', duty:1, off:3, dutyDate:'2018-11-28', _id:'id2', periodTimes: 1, howMany: 2},
		{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5', periodTimes: 2, howMany: 4}
	],
	[
		{shift:'Суточная 3', duty:1, off:3, dutyDate:'2018-11-29', _id:'id3', periodTimes: 1, howMany: 2},
		{shift:'Оперативная 1', duty:2, off:2, dutyDate:'2018-11-28', _id:'id5', periodTimes: 2, howMany: 4}
	]
];
