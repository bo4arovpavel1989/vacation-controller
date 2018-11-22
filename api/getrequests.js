const db = require('./dbqueries');
const {getPositions, getVacationHandoutBounds} = require('./customfunctions');

module.exports.getObject = function(req, res) {
  const query = req.params.id ? {_id: req.params.id} : {},
        {type} = req.params;

  db.find(type, query, '-__v')
    .then(rep=>res.json(rep))
    .catch(err=>res.status(500).json({err:err.message}))
}

module.exports.getVacationHandout = function(req, res){
  let positions, dateTo;

  getPositions()
    .then(rep=>{
      positions=rep;
      console.log(positions)
      
      return getVacationHandoutBounds()
    })
    .then(rep=>{
      dateTo = rep;
      console.log(dateTo);
      res.json({positions})
    })
}
