'use strict'

const {API_URL} = require('./config');

const handleResponse = response=>response.json().then(json=>response.ok ? json : Promise.reject(json));

/**
 * Function gets form object from html and returns body object
 * for fetching to API
 * @param {object} formObj - form object got from HTML
 * @returns {object} - body object for fetching
*/

module.exports.getForm = function getForm (formObj) {
  const fields = Object.keys(formObj);
  let formBody = {};

  fields.forEach(field=>{
    const input = formObj[field];

    if(input.type !== 'submit')
      formBody[input.name] = input.value;
  })

  return formBody;
}

/**
* Function get body object and url and fetch data to API
* @param {string} url - url of API
* @param {object} data - body data object for fetching
* @returns {Promise} - response from API
*/

module.exports.postData = function postData(url, data) {
  return new Promise((resolve, reject)=>{
    fetch(`${API_URL}/${url}`, {
      method:'POST',
      mode:'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:data
    })
    .then(handleResponse)
    .then(rep=>resolve(rep))
    .catch(err=>reject(err))
  });
};
