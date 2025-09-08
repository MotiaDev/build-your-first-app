// steps/javascript/delete-pet.step.js
const { remove } = require('./js-store');

exports.config = { type:'api', name:'JsDeletePet', path:'/js/pets/:id', method:'DELETE', emits: [] };
exports.handler = async (req) => {
  const ok = remove(req.pathParams.id);
  return ok ? { status:204, body:{} } : { status:404, body:{ message:'Not found' } };
};
