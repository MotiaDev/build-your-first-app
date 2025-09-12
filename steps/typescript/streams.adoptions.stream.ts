import { StreamConfig } from 'motia';
import { z } from 'zod';

export const config: StreamConfig = {
  name: 'adoptions',
  schema: z.object({
    entityId: z.string(),
    type: z.enum(['application', 'pet']),
    phase: z.string(),
    message: z.string().optional(),
  }),
  baseConfig: { storageType: 'default' },
};
