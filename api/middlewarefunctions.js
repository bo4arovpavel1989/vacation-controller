const {calculateVacationEnd} = require('./customfunctions');


module.exports.noMiddleware = function(req, res, next){
	next();
};


/**
 * Function returns preHandler function if needed
 * @param {Object} req - API request Object
 * @param {Object} res - API response Object
 * @param {Object} next - API middleware next Object
 * @returns {Promise} handler function or just req object if not any
 */
module.exports.preHandleAddObject = function(req, res, next){
  const {type} = req.params;
  const addHandlerMap = {
    Vacation: r=>calculateVacationEnd(r)
  }

  if(addHandlerMap[type]){
		addHandlerMap[type](req) ?
			next()	 :
			res.status(500).json({err:'Error prehandling adding object'})
	} else {
		res.status(500).json({err:'Error prehandling adding object'})
	}
  };
