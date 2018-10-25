const db = require('./dbqueries');

module.exports.deleteObject = function(req, res) {
  db.del(req.params.type, {_id:req.params.id})
    .then(rep=>res.json(rep))
    .catch(err=>res.status(500).json({err:err.message}))
}
