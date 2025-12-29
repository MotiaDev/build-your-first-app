import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  /**
   * This will be available as context.streams.petCreation in the FlowContext
   */
  name: 'petCreation',
  
  /**
   * Schema defines the structure of stream updates
   */
  schema: z.object({ 
    message: z.string()
  }),

  /**
   * Use default storage for the stream
   */
  baseConfig: {
    storageType: 'default',
  },
}
