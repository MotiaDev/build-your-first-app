// steps/javascript/update-pet.step.js
const { update } = require('./js-store');

exports.config = { type:'api', name:'JsUpdatePet', path:'/js/pets/:id', method:'PUT', emits: [], flows: ['pets'] };
exports.handler = async (req) => {
  const b = req.body || {};
  const patch = {};
  if (typeof b.name === 'string') patch.name = b.name;
  if (['dog','cat','bird','other'].includes(String(b.species))) patch.species = b.species;
  if (Number.isFinite(b.ageMonths)) patch.ageMonths = Number(b.ageMonths);
  if (['available','pending','adopted'].includes(String(b.status))) patch.status = b.status;
  const updated = update(req.pathParams.id, patch);
  return updated ? { status:200, body:updated } : { status:404, body:{ message:'Not found' } };
};
