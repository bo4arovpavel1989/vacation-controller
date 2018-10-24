module.exports.API_URL = 'http://localhost:8080';

module.exports.getPage = function() {
  let idElement = document.getElementById('pageId');
  
  return idElement.dataset.id;
}
