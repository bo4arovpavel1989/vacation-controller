'use strict'

module.exports.API_URL = 'http://K47_8:9200';

module.exports.getPage = function() {
  const idElement = document.getElementById('pageId');

  return idElement.dataset.id;
}

module.exports.defaultFetch = function(method='GET', body){
  const configFetch = {
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
