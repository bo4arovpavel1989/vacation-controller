const db = require('./dbqueries');

module.exports.addObject = function (req, res) {
	console.log(req.params.id)
		console.log(req.body)
	db.create(req.params.id, req.body)
		.then(()=>res.json({success:true}))
		.catch(err=>{console.log(err);res.status(500).json({err})})
}
