const db = require('./dbqueries');

module.exports.deleteObject = function(req, res) {
  db.del(req.params.type, {_id:req.params.id})
    .then(()=>res.json({success:true}))
    .catch(err=>res.status(500).json({err:err.message}))
}