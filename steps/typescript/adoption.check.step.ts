import { Handlers } from 'motia';

export const config = {
  type: 'event',
  name: 'TsAdoptionCheck',
  subscribes: ['ts.adoption.applied'],
  emits: ['ts.adoption.checked'],
  flows: ['adoptions'],
};

export const handler = async (event: any, context?: any) => {
  const { emit, logger, streams, traceId } = context || {};
  const { applicationId, petId } = event || {};

  if (logger) {
    logger.info('Background check complete', { applicationId, petId });
  }

  if (streams?.adoptions && traceId) {
    await streams.adoptions.set(traceId, 'status', {
      entityId: applicationId,
      type: 'application',
      phase: 'checked',
    });
  }

  if (emit) {
    await emit({ topic: 'ts.adoption.checked', data: { applicationId, petId, traceId } });
  }
};
