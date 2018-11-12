'use strict'

module.exports.API_URL = 'http://localhost:8080';

module.exports.getPage = function() {
  let idElement = document.getElementById('pageId');

  return idElement.dataset.id;
}

module.exports.defaultFetch = function(method='GET', body){
  let configFetch =  {
      method,
      mode:'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

  if(body) Object.assign(configFetch, {body:JSON.stringify(body)})

  return configFetch;
}
