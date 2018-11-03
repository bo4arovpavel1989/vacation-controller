const db = require('./dbqueries');
const {editAllEmbeddedDocs, getFullDates, getOrQuery, getNamesQuery} = require('./customfunctions');

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
	const shifts = req.body.shifts || [];
	const positions = req.body.positions || [];
	const dates = getFullDates(req.body);
	const orQuery = getOrQuery(req.body);

	db.find('Person', {$or: orQuery})
		.then(rep=>{
			const namesQuery = getNamesQuery(rep);

			return db.find('Vacation', {
					$and: [
						{$or:namesQuery},
						{$or: [
							{dateFrom: {$lte:dates[0]}, dateTo:{$gte:dates[1]}},
							{dateFrom: {$lte:dates[0]}, dateTo:{$gte:dates[0], $lt:dates[1]}},
							{dateFrom: {$gte:dates[0], $lt:dates[1]}, dateTo:{$gte:dates[0], $lt:dates[1]}},
							{dateFrom: {$gte:dates[0], $lt:dates[1]}, dateTo:{$gte:dates[1]}}
						]}
					]
				})
		})
	.then(rep=>res.json(rep))
	.catch(err=>res.status(500).json({err:err.message}))
}
