// steps/javascript/adoption.decision.step.js
const { get, update } = require('./js-store');

exports.config = { type:'event', name:'JsAdoptionDecision', subscribes:['js.adoption.summary.ready'], emits:['js.adoption.approved'], flows:['adoptions'] };

exports.handler = async (evt, { emit, logger, streams, traceId }) => {
  const { applicationId, petId } = evt || {};
  const pet = get(petId);
  if (!pet) return;

  update(petId, { status:'adopted' });
  logger.info('Adoption approved, pet marked adopted', { applicationId, petId });

  await streams.adoptions.set(traceId, 'status', {
    entityId: applicationId, type: 'application', phase: 'approved'
  });
  await streams.adoptions.set(traceId, 'availability', {
    entityId: petId, type: 'pet', phase: 'adopted', message: 'Pet adopted'
  });

  await emit({ topic:'js.adoption.approved', data:{ applicationId, petId, traceId } });
};
