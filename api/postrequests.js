const db = require('./dbqueries');
const {editAllEmbeddedDocs, preHandleAddObject, getFullDates} = require('./customfunctions');

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
	const dates = getFullDates(req.body)

	res.json({success:true})
}
