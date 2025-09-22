// steps/javascript/get-pets.step.js
const { list } = require('./js-store');

exports.config = { type:'api', name:'JsListPets', path:'/js/pets', method:'GET', emits: [], flows: ['pets'] };
exports.handler = async () => ({ status:200, body:list() });
