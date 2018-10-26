const db = require('./dbqueries');

module.exports.addObject = function (req, res) {
	db.create(req.params.id, req.body)
		.then(()=>res.json({success:true}))
		.catch(err=>res.status(500).json({err:err.message}))
};

module.exports.editObject = function(req, res){
	const {type} = req.params,
				{_id} = req.body;
	console.log(req.body);
	db.update(type, {_id}, {$set:req.body})
		.then(rep=>res.json({success:true}))
		.catch(err=>res.status(500).json({err:err.message}))
};
