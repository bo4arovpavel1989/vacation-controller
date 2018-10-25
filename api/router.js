const postRequestsHandlers=require('./postrequests.js');
const getRequestsHandlers=require('./getrequests.js');
const deleteRequestsHandlers=require('./deleterequests.js');
const {noMiddleware} = require('./middlewarefunctions.js');

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
	}
];

const postRequests = [
	{
		url: '/addobject/:id',
		middleware:noMiddleware,
		callback:postRequestsHandlers.addObject
	}
];

const deleteRequests = [
		{
			url: '/deleteobject/:type/:id',
			middleware:noMiddleware,
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
