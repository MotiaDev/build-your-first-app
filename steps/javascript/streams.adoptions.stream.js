// steps/javascript/streams.adoptions.stream.js
exports.config = {
  name: 'adoptions',
  schema: {
    // Declarative shape for Workbench; runtime stays flexible
    shape: {
      entityId: 'string',
      type: ['application','pet'],
      phase: 'string',
      message: 'string?'
    }
  },
  baseConfig: { storageType: 'default' }
};
