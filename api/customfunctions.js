const db = require('./dbqueries');
const _ = require('lodash');

module.exports.editAllEmbeddedDocs = function(req){
  const dependencyTree = {
    Shift: {
      Person: 'shift'
    },
    Position:{
      Person:'position'
    },
    Person:{
      Vacation:'person'
    }
  }

  return new Promise((resolve, reject)=>{
    const {type} = req.params,
          {_id} = req.body,
          dependant = dependencyTree[type],
          newState = req.body;

    if(!dependant)
      resolve();

    // As for dependant always has only 1 property
    let [propToChange] = _.values(dependant);
    let [docToChange] = _.keys(dependant);

    db.findOne(type, {_id})
      .then(rep=>{
        return Promise.resolve(rep[propToChange])
      })
      .then(propOldVal=>{
        let findProp = {},
            setProp = {$set:{}};

        findProp[propToChange] = propOldVal;
        setProp.$set[propToChange] = newState[propToChange];
        return db.update(docToChange, findProp, setProp, {multi: true})
      })
      .then(()=>resolve())
      .catch(err=>reject(err.message))
  })

}
