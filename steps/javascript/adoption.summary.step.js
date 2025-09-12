// steps/javascript/adoption.summary.step.js
const { get } = require('./js-store');

exports.config = { type:'event', name:'JsAdoptionSummary', subscribes:['js.adoption.checked'], emits:['js.adoption.summary.ready'], flows:['adoptions'] };

exports.handler = async (evt, { emit, logger, streams, traceId }) => {
  const { applicationId, petId } = evt || {};
  const pet = get(petId);
  const message = pet
    ? `Application ${applicationId} for ${pet.name} the ${pet.species} looks good. Proceeding to approval.`
    : `Application ${applicationId} looks good. Proceeding to approval.`;

  logger.info('Adoption summary generated', { applicationId, petId, message });

  await streams.adoptions.set(traceId, 'summary', {
    entityId: applicationId, type: 'application', phase: 'summary_ready', message
  });

  await emit({ topic:'js.adoption.summary.ready', data:{ applicationId, petId, message, traceId } });
};
