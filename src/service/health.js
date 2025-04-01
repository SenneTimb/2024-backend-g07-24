const packageJson = require('../../package.json');

const ping = () => ({ pong: true });

const getVersion = () => ({
  env: process.env.NODE_ENV,
  version: packageJson.version,
  name: packageJson.name,
});

module.exports = {
  ping,
  getVersion,
};