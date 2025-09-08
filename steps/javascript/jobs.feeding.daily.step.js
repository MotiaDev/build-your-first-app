// steps/javascript/jobs.feeding.daily.step.js
exports.config = { type: 'cron', name: 'JsDailyFeeding', cron: '30 2 * * *', emits: [], flows: ['pets'] };

exports.handler = async ({ logger }) => {
  const { list } = require('./js-store');
  for (const p of list()) {
    if (p.status !== 'adopted') logger.info('Feeding reminder', { id: p.id, name: p.name });
  }
};
