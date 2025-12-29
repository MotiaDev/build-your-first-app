// steps/javascript/get-pet.step.js
const { get } = require('./js-store');

exports.config = { type:'api', name:'JsGetPet', path:'/js/pets/:id', method:'GET', emits: [], flows: ['JsPetManagement'] };
exports.handler = async (req) => {
  const pet = get(req.pathParams.id);
  return pet ? { status:200, body:pet } : { status:404, body:{ message:'Not found' } };
};
