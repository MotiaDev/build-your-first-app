import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsAdoptionSummary',
  subscribes: ['ts.adoption.checked'],
  emits: ['ts.adoption.summary.ready'],
  flows: ['adoptions'],
};

export const handler = async (event: any, context?: any) => {
  const { emit, logger, streams, traceId } = context || {};
  const { applicationId, petId } = event || {};
  
  const pet = TSStore.get(petId);
  const message = pet
    ? `Application ${applicationId} for ${pet.name} the ${pet.species} looks good. Proceeding to approval.`
    : `Application ${applicationId} looks good. Proceeding to approval.`;

  if (logger) {
    logger.info('Adoption summary generated', { applicationId, petId, message });
  }

  if (streams?.adoptions && traceId) {
    await streams.adoptions.set(traceId, 'summary', {
      entityId: applicationId,
      type: 'application',
      phase: 'summary_ready',
      message,
    });
  }

  if (emit) {
    await emit({ topic: 'ts.adoption.summary.ready', data: { applicationId, petId, message, traceId } });
  }
};
