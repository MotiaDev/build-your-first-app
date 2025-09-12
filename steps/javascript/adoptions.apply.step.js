// steps/javascript/adoptions.apply.step.js
const { get } = require('./js-store');

exports.config = {
  type: 'api',
  name: 'JsAdoptionApply',
  path: '/js/adoptions/apply',
  method: 'POST',
  emits: ['js.adoption.applied'],
  flows: ['adoptions']
};

exports.handler = async (req, { emit, logger, streams, traceId }) => {
  const b = req.body || {};
  const petId = String(b.petId || '');
  const pet = get(petId);
  if (!pet) return { status: 404, body: { message: 'Pet not found' } };
  if (pet.status === 'adopted') return { status: 409, body: { message: 'Pet already adopted' } };

  const applicationId = `app-${Date.now()}`;
  logger.info('Application received', { applicationId, petId });

  // Create & return the initial stream record (grouped by traceId)
  const record = await streams.adoptions.set(traceId, 'status', {
    entityId: applicationId, type: 'application', phase: 'applied'
  });

  await emit({ topic: 'js.adoption.applied', data: { applicationId, petId, traceId } });
  return { status: 202, body: record };
};
