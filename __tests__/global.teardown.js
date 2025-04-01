const { shutdownData } = require('../src/data');

module.exports = async () => {
  console.log('shutting down tests');
  await shutdownData();
};