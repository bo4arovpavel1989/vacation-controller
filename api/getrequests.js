const db = require('./dbqueries');

module.exports.getObject = function(req, res) {
  const query = {};

  db.find(req.params.id, query)
    .then(rep=>res.json(rep))
    .catch(err=>res.status(500).json({err:err.message}))
}
