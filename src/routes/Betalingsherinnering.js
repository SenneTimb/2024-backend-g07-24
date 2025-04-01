/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
const Router = require('@koa/router');
const Joi = require('joi');

const {requireAuthentication, makeRequireRole} = require('../core/auth');
const Role = require('../core/rollen');

const validatie = require('../core/validation');
const herinneringService = require('../service/herinneringen');

/**
 * Install health routes in the given router.
 *
 * @param {Router} app - The parent router.
 */



const getLaatsteBetalingsherinnering = async (ctx) => {
  const { orderId } = ctx.params;
  const herinnering = await herinneringService.getLaatsteBetalingsherinnering(orderId);


  ctx.status = 200;
  ctx.body = herinnering;
};

getLaatsteBetalingsherinnering.validationScheme = {
  params: Joi.object({
    orderId: Joi.number().integer().positive().required(),
  }),
};


module.exports = function installHealthRoutes(app) {
  const router = new Router({
    prefix: '/betalingsherinneringen',
  });
  
  const requireAdmin = makeRequireRole(Role.ADMIN);
  const requireLeverancier = makeRequireRole(Role.LEVERANCIER);
  const requireKlant = makeRequireRole(Role.KLANT);

  // producten opvragen van een bestelling
  router.get('/:orderId', requireAuthentication, validatie(getLaatsteBetalingsherinnering.validationScheme), getLaatsteBetalingsherinnering);

  app.use(router.routes()).use(router.allowedMethods());
};