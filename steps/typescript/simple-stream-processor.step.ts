// steps/typescript/simple-stream-processor.step.ts
export const config = {
  type: 'event',
  name: 'TsSimpleStreamProcessor',
  description: 'Processes simple stream events and streams updates',
  subscribes: ['ts.simple.stream.started'],
  emits: ['ts.simple.stream.completed'],
  flows: ['TsPetManagement']
};

export const handler = async (input: any, context?: any) => {
  const { emit, logger, streams, traceId } = context || {};
  const { message, traceId: inputTraceId } = input;

  if (logger) {
    logger.info('🔄 Processing simple stream', { message, traceId: inputTraceId });
  }

  try {
    // Follow the exact pattern from docs - populate the previously created message
    const currentTraceId = traceId || inputTraceId;
    
    if (streams?.petCreation && currentTraceId) {
      // Simulate processing with multiple updates to the same stream key
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the message with processing status
      await streams.petCreation.set(currentTraceId, 'message', { 
        message: `Processing: ${message}...` 
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update with progress
      await streams.petCreation.set(currentTraceId, 'message', { 
        message: `Almost done with: ${message}` 
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Final result
      await streams.petCreation.set(currentTraceId, 'message', { 
        message: `Completed: ${message} ✅` 
      });
    }

    if (emit) {
      await emit({
        topic: 'ts.simple.stream.completed',
        data: {
          message,
          completedAt: Date.now(),
          traceId: currentTraceId
        }
      });
    }

  } catch (error: any) {
    if (logger) {
      logger.error('❌ Simple stream processing error', { message, error: error.message });
    }
  }
};
