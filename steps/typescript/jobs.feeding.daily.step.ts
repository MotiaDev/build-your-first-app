// steps/typescript/jobs.feeding.daily.step.ts
import { CronConfig, Handlers } from 'motia';
import { TSStore } from './ts-store';

export const config: CronConfig = {
  type: 'cron',
  name: 'TsDailyFeeding',
  cron: '30 2 * * *',   // ≈ 07:30 IST if server is UTC
  emits: [],
  flows: ['pets_management'],
};

export const handler: Handlers['TsDailyFeeding'] = async ({ logger }) => {
  for (const p of TSStore.list()) {
    if (p.status !== 'adopted') {
      logger.info('Feeding reminder', { id: p.id, name: p.name });
    }
  }
};
