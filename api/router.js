const postRequestsHandlers=require('./postrequests.js');
const getRequestsHandlers=require('./getrequests.js');
const deleteRequestsHandlers=require('./deleterequests.js');
const {noMiddleware, preHandleAddObject, checkCachedHandout} = require('./middlewarefunctions.js');

const getRequests = [
	{
		url:'/getobject/:type/:id',
		middleware:noMiddleware,
		callback:getRequestsHandlers.getObject
	},
	{
		url:'/getobject/:type',
		middleware:noMiddleware,
		callback:getRequestsHandlers.getObject
	},
	{
		url:'/vacationhandout',
		middleware:checkCachedHandout,
		callback:getRequestsHandlers.getVacationHandout
	}
];

const postRequests = [
	{
		url: '/addobject/:type',
		middleware:preHandleAddObject,
		callback:postRequestsHandlers.addObject
	},
	{
		url: '/editobject/:type',
		middleware:preHandleAddObject,
		callback:postRequestsHandlers.editObject
	},
	// Because i handle form - its in postrequests
	{
		url: '/getvacationsbyfilter',
		middleware:noMiddleware,
		callback:postRequestsHandlers.getVacationsByFilter
	},
	// Because i handle form - its in postrequests
	{
		url: '/getshiftcalendar',
		middleware:noMiddleware,
		callback:postRequestsHandlers.getShiftCalendar
	}
];

const deleteRequests = [
		{
			url: '/deleteobject/:type/:id',
			middleware:preHandleAddObject,
			callback:deleteRequestsHandlers.deleteObject
		}
];

const router = function (app) {
	getRequests.forEach(request=>{
		app.get(request.url, request.middleware, request.callback);
	});
	postRequests.forEach(request=>{
		app.post(request.url, request.middleware, request.callback)
	});
	deleteRequests.forEach(request=>{
		app.delete(request.url, request.middleware, request.callback)
	});
};

module.exports.router = router;
