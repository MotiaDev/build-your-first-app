// steps/javascript/adoption.check.step.js
exports.config = { type:'event', name:'JsAdoptionCheck', subscribes:['js.adoption.applied'], emits:['js.adoption.checked'], flows:['adoptions'] };

exports.handler = async (evt, { emit, logger, streams, traceId }) => {
  const { applicationId, petId } = evt || {};
  logger.info('Background check complete', { applicationId, petId });

  await streams.adoptions.set(traceId, 'status', {
    entityId: applicationId, type: 'application', phase: 'checked'
  });

  await emit({ topic:'js.adoption.checked', data:{ applicationId, petId, traceId } });
};
