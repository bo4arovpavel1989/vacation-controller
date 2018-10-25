const db = require('./dbqueries');

module.exports.getObject = function(req, res) {
  console.log(req.params)
  const query = req.params.id ? {_id: req.params.id} : {};
  const {type} = req.params

  db.find(req.params.type, query, '-__v')
    .then(rep=>res.json(rep))
    .catch(err=>res.status(500).json({err:err.message}))
}
