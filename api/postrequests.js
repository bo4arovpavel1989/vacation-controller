const db = require('./dbqueries');
const {
		editAllEmbeddedDocs,
		getFullDates,
		getOrQuery,
		getNamesQuery,
		getDatesQuery,
		concatPersonArrays
	} = require('./customfunctions');

module.exports.addObject = function (req, res) {
	const {type} = req.params;

	db.create(type, req.body)
		.then(()=>res.json({success:true}))
		.catch(err=>res.status(500).json({err:err.message}))
};

module.exports.editObject = function(req, res){
	const {type} = req.params,
				{_id} = req.body;

	editAllEmbeddedDocs(req)
		.then(()=>db.update(type, {_id}, {$set:req.body}))
		.then(rep=>res.json({success:true}))
		.catch(err=>res.status(500).json({err:err.message}))
};

module.exports.getVacationsByFilter = function(req, res){
	const dates = getFullDates(req.body);
	const orQuery = getOrQuery(req.body);
	let namesQuery = [];

	db.find('Person', {$or: orQuery})
		.then(rep=>{
			const datesQuery = getDatesQuery(dates);

			namesQuery = getNamesQuery(rep);

			return db.find('Vacation', {
					$and: [
						{$or:namesQuery},
						{$or: datesQuery}
					]
				})
		})
	.then(vacations=>res.json(concatPersonArrays(namesQuery, vacations)))
	.catch(err=>res.status(500).json({err:err.message}))
}

module.exports.getShiftCalendar = function(req, res){
	const dates = getFullDates(req.body);
	
};
