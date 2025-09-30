// steps/typescript/simple-stream.step.ts
import { ApiRouteConfig, Handlers } from 'motia';

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsSimpleStream',
  path: '/ts/simple-stream',
  method: 'POST',
  emits: ['ts.simple.stream.started'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsSimpleStream'] = async (req, { emit, logger, streams, traceId }) => {
  const b: any = req.body ?? {};
  const message = String(b.message || 'Hello World');
  
  if (logger) {
    logger.info('🚀 Simple stream started', { message, traceId });
  }

  // Create & return the initial stream record (following docs pattern exactly)
  const result = await streams.petCreation.set(traceId, 'message', { 
    message: '' 
  });

  if (emit) {
    await emit({ 
      topic: 'ts.simple.stream.started', 
      data: { 
        message,
        traceId 
      } 
    });
  }
  
  // Return the entire object received from the create method (as per docs)
  return { 
    status: 200, 
    body: result 
  };
};
