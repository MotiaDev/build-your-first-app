// steps/javascript/create-pet.step.js
const { create } = require('./js-store');

exports.config = {
  type: 'api',
  name: 'JsCreatePet',
  path: '/js/pets',
  method: 'POST',
  emits: ['js.pet.created', 'js.feeding.reminder.enqueued'],
  flows: ['JsPetManagement']
};

exports.handler = async (req, context) => {
  const { emit, logger } = context || {};
  const b = req.body || {};
  const name = typeof b.name === 'string' && b.name.trim();
  const speciesOk = ['dog','cat','bird','other'].includes(b.species);
  const ageOk = Number.isFinite(b.ageMonths);
  if (!name || !speciesOk || !ageOk) {
    return { status: 400, body: { message: 'Invalid payload: {name, species, ageMonths}' } };
  }
  const pet = create({ name, species: b.species, ageMonths: Number(b.ageMonths) });
  
  if (logger) {
    logger.info('🐾 Pet created', { petId: pet.id, name: pet.name, species: pet.species, status: pet.status });
  }
  
  if (emit) {
    await emit({
      topic: 'js.pet.created',
      data: { petId: pet.id, event: 'pet.created', name: pet.name, species: pet.species }
    });
    
    // Enqueue feeding reminder background job
    await emit({
      topic: 'js.feeding.reminder.enqueued',
      data: { petId: pet.id, enqueuedAt: Date.now() }
    });
  }
  
  return { status: 201, body: pet };
};
