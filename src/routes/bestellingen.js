/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
const Router = require('@koa/router');
const Joi = require('joi');

const {requireAuthentication, makeRequireRole} = require('../core/auth');
const Role = require('../core/rollen');

const validatie = require('../core/validation');
const orderService = require('../service/order');
const userService = require('../service/user');

/**
 * Install health routes in the given router.
 *
 * @param {Router} app - The parent router.
 */


const getAllOrders = async (ctx) => {
  const orders = await orderService.getAllOrders();

  ctx.status = 200;
  ctx.body = orders;
};

getAllOrders.validationScheme = {
  params: Joi.object({}),
};



const getByLeverancier = async (ctx) => {
  const {pagina, filterBy, filterWaarde, orderBy, orderWaarde} = ctx.query;
  const companyId = await userService.getCompanyIdByUserId(ctx.state.session.userId);
  const orders = await orderService.getByLeverancier(companyId, pagina, filterBy, filterWaarde, orderBy, orderWaarde);

  ctx.status = 200;
  ctx.body = orders;
}; 

getByLeverancier.validationScheme = { 
  query: Joi.object({ 
    pagina: Joi.number().integer(),
    filterBy: Joi.string(),
    filterWaarde: Joi.string().allow('', null),
    orderBy: Joi.string(),
    orderWaarde: Joi.string()
  }) 
};

const getByKlant = async (ctx) => {
  const {pagina, filterBy, filterWaarde, orderBy, orderWaarde} = ctx.query;
  const companyId = await userService.getCompanyIdByUserId(ctx.state.session.userId);
  const orders = await orderService.getByKlant(companyId, pagina, filterBy, filterWaarde, orderBy, orderWaarde);

  ctx.status = 200;
  ctx.body = orders;
};

getByKlant.validationScheme = { 
  query: Joi.object({ 
    pagina: Joi.number().integer(),
    filterBy: Joi.string(),
    filterWaarde: Joi.string().allow('', null),
    orderBy: Joi.string(),
    orderWaarde: Joi.string()
  }) 
};

const getOrderById = async (ctx) => {
  const { id } = ctx.params;
  const order = await orderService.getOrderById(id);

  ctx.status = 200;
  ctx.body = order;
};

getOrderById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const wijzigStatusen = async (ctx) => {
  const { betalingsstatus, orderstatus } = ctx.request.body;
  const numRowsUpdated = await orderService.wijzigStatusen(ctx.request.params.id, betalingsstatus, orderstatus);
  
  ctx.status = 200;
  ctx.body = numRowsUpdated;
};

wijzigStatusen.validationScheme = {
  params: Joi.object({
    id: Joi.number().required()
  }),
  body: Joi.object({
    betalingsstatus: Joi.number().required(),
    orderstatus: Joi.number().required(),
  }),
};

const betaalBestelling = async (ctx) => {
  const { betalingsstatus } = ctx.request.body;

  const numRowsUpdated = await orderService.betaalOrder(
    ctx.request.params.id, betalingsstatus, ctx.state.session.rol);
  
  ctx.status = 200;
  ctx.body = numRowsUpdated;
}; 

betaalBestelling.validationScheme = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
  body: Joi.object({
    betalingsstatus: Joi.number().required(),
  }),
};

module.exports = function installHealthRoutes(app) {
  const router = new Router({
    prefix: '/bestellingen',
  });
  
  const requireAdmin = makeRequireRole(Role.ADMIN);
  const requireLeverancier = makeRequireRole(Role.LEVERANCIER);
  const requireKlant = makeRequireRole(Role.KLANT);

  router.get('/', requireAuthentication ,requireAdmin, validatie(getAllOrders.validationScheme), getAllOrders);

  // Bestellingen opvragen als leverancier
  router.get('/leverancier', requireAuthentication, requireLeverancier, validatie(getByLeverancier.validationScheme), getByLeverancier);

  //Bestellingen opvragen als klant
  router.get('/klant', requireAuthentication, requireKlant, validatie(getByKlant.validationScheme), getByKlant);

  router.get('/:id', requireAuthentication, validatie(getOrderById.validationScheme), getOrderById);
  router.put('/:id', requireAuthentication, requireLeverancier, validatie(wijzigStatusen.validationScheme), wijzigStatusen);
  router.put('/betaal/:id', requireAuthentication, requireKlant, validatie(betaalBestelling.validationScheme), betaalBestelling);

  app.use(router.routes()).use(router.allowedMethods());
};