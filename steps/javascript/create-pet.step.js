// steps/javascript/create-pet.step.js
const { create } = require('./js-store');

exports.config = {
  type: 'api',
  name: 'JsCreatePet',
  path: '/js/pets',
  method: 'POST',
  emits: []
};

exports.handler = async (req) => {
  const b = req.body || {};
  const name = typeof b.name === 'string' && b.name.trim();
  const speciesOk = ['dog','cat','bird','other'].includes(b.species);
  const ageOk = Number.isFinite(b.ageMonths);
  if (!name || !speciesOk || !ageOk) {
    return { status: 400, body: { message: 'Invalid payload: {name, species, ageMonths}' } };
  }
  const pet = create({ name, species: b.species, ageMonths: Number(b.ageMonths) });
  return { status: 201, body: pet };
};
