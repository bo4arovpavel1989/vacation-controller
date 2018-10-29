const db = require('./dbqueries');
const {editAllEmbeddedDocs, preHandleAddObject} = require('./customfunctions');

module.exports.addObject = function (req, res) {
	const {type} = req.params;

	preHandleAddObject(req)
		.then(handledReq=>db.create(type, handledReq.body))
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
