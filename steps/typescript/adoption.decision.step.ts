import { TSStore } from './ts-store';

export const config = {
  type: 'event',
  name: 'TsAdoptionDecision',
  subscribes: ['ts.adoption.summary.ready'],
  emits: ['ts.adoption.approved'],
  flows: ['adoptions'],
};

export const handler = async (event: any, context?: any) => {
  const { emit, logger, streams, traceId } = context || {};
  const { applicationId, petId } = event || {};
  
  const pet = TSStore.get(petId);
  if (!pet) return;

  TSStore.update(petId, { status: 'adopted' });
  
  if (logger) {
    logger.info('Adoption approved, pet marked adopted', { applicationId, petId });
  }

  if (streams?.adoptions && traceId) {
    await streams.adoptions.set(traceId, 'status', {
      entityId: applicationId,
      type: 'application',
      phase: 'approved',
    });

    await streams.adoptions.set(traceId, 'availability', {
      entityId: petId,
      type: 'pet',
      phase: 'adopted',
      message: 'Pet adopted',
    });
  }

  if (emit) {
    await emit({ topic: 'ts.adoption.approved', data: { applicationId, petId, traceId } });
  }
};
