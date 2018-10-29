const db = require('./dbqueries');
const _ = require('lodash');

/**
 * Function calculates end date of Vacation
 * @param {Object} req - API request Object
 * @returns {Promise} handled request object with dateTo prop added
 */
const calculateVacationEnd = function(req){
  try{
    const {dateFrom, long} = req.body;
    const dayLong = 1000 * 60 * 60 * 24;
    const dateTo = Date.parse(dateFrom) + (long * dayLong);

    req.body.dateTo = dateTo;

    return Promise.resolve(req)
  }catch(err){
    return Promise.reject(err)
  }
}

/**
 * Function returns preHandler function if needed
 * @param {Object} req - API request Object
 * @returns {Promise} handler function or just req object if not any
 */
module.exports.preHandleAddObject = function(req){
  const {type} = req.params;
  const addHandlerMap = {
    Vacation: r=>calculateVacationEnd(r)
  }

  if(addHandlerMap[type])
      return addHandlerMap[type](req)

  return Promise.resolve(req);
  };

/**
 * Function edits fields in other docs, that
 * contain edited field
 * @param {Object} req - API request Object
 * @returns {Promise} indicates success of the operation
 */
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
