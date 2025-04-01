const Koa = require('koa');
const config = require('config');

const { initializeLogger, getLogger } = require('./core/logging');
const installMiddlewares = require('./core/installMiddlewares');
const installRoutes = require('./routes');
const { initializeData, shutdownData } = require('./data');
const { initSocket } = require('./core/socket');
// const { initSocket } = require('./core/socketIO');

const NODE_ENV = process.env.NODE_ENV;
const LOG_LEVEL = config.get('log.level');
const LOG_DISABLED = config.get('log.disabled');

module.exports = async function createServer() {

  initializeLogger({
    level: LOG_LEVEL,
    disabled: LOG_DISABLED,
    defaultMeta: {
      NODE_ENV,
    },
  });

  await initializeData();

  const logger = getLogger();
  const app = new Koa();
 

  // await initSocket(app);
  installMiddlewares(app);

  const server = await initSocket(app);

  installRoutes(app);

  return {
    getApp() {
      return app;
    },
    start() {
      return new Promise((resolve) => {
        server.listen(9000, () => {
          logger.info('🚀 Server listening on http://localhost:9000');
          resolve();
        });
      });
    },
    async stop() {
      app.removeAllListeners();
      shutdownData();
      getLogger().info('Goodbye! 👋');
    },
  };
};