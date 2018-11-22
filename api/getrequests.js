const db = require('./dbqueries');
const {getPositions} = require('./customfunctions');

module.exports.getObject = function(req, res) {
  const query = req.params.id ? {_id: req.params.id} : {},
        {type} = req.params;

  db.find(type, query, '-__v')
    .then(rep=>res.json(rep))
    .catch(err=>res.status(500).json({err:err.message}))
}

module.exports.getVacationHandout = function(req, res){
  getPositions()
    .then(positions=>{
      console.log(positions)
      res.json({positions})
    })
}
