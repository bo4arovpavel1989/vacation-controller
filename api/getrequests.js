const db = require('./dbqueries');
const {getNewProblemsCalendar} = require('./customfunctions');

module.exports.getObject = function(req, res) {
  const query = req.params.id ? {_id: req.params.id} : {},
        {type} = req.params;

  db.find(type, query, '-__v')
    .then(rep=>res.json(rep))
    .catch(err=>res.status(500).json({err:err.message}))
}

module.exports.getVacationHandout = function(req, res){
    db.findOne('ProblemsCalendar')
      .then(rep=>{
        if(!rep || rep.needToUpdate)
          return getNewProblemsCalendar()

        console.log('Getting problemsCalendar from cache');

        return Promise.resolve(rep)
      })
      .then(calendar=>res.json(calendar))
      .catch(err=>res.status(500).json({err:err.message}))
}
