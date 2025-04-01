const Router = require('@koa/router');

const installHealth = require('./health');
const installUsers = require('./users');
const installBedrijven = require('./bedrijven');
const installBestellingen = require('./bestellingen');
const installProducts = require('./product');
const installHerinneringen = require('./Betalingsherinnering');
const installNotificaties = require('./notificaties');

/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */
module.exports = (app) => {
  const router = new Router({
    prefix: '/api',
  });

  installHealth(router);
  installUsers(router);
  installBedrijven(router);
  installBestellingen(router);
  installProducts(router);
  installHerinneringen(router);
  installNotificaties(router);

  app.use(router.routes())
    .use(router.allowedMethods());
};
