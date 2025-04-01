/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
const Router = require('@koa/router');
const Joi = require('joi');

const {requireAuthentication, makeRequireRole} = require('../core/auth');
const Role = require('../core/rollen');

const validatie = require('../core/validation');
const notificationService = require('../service/notifications');
const userService = require('../service/user');
const { socketIO } = require('../createServer');
 

/**
 * Install health routes in the given router.
 *
 * @param {Router} app - The parent router.
 */

const getAllNotifications= async (ctx) => {
  const notifications = await notificationService.getAllOrders();

  ctx.status = 200;
  ctx.body = notifications;
};

getAllNotifications.validationScheme = {
  params: Joi.object({}),
};

const getByLeverancier = async (ctx) => {
  const companyId = await userService.getCompanyIdByUserId(ctx.state.session.userId);
  const notifications = 
    await notificationService.getByLeverancier(companyId, ctx.request.query.limit === 'true');

  ctx.status = 200;
  ctx.body = notifications;
};

getByLeverancier.validationScheme = {
  query: Joi.object({
    limit: Joi.boolean()
  })
};

const getByKlant = async (ctx) => {
  const companyId = await userService.getCompanyIdByUserId(ctx.state.session.userId);
  const notifications = 
    await notificationService.getByKlant(companyId, ctx.request.query.limit === 'true');

  ctx.status = 200;
  ctx.body = notifications;
};

getByKlant.validationScheme = {
  query: Joi.object({
    limit: Joi.boolean().required()
  })
};

const createNotification = async (ctx) => {

  const {tekst, type, order_id} = ctx.request.body;

  const notification = await notificationService.create(tekst, type, order_id, ctx.state.session.rol);

  ctx.status = 201;
  ctx.body = notification;

};

createNotification.validationScheme = {
  body: Joi.object({
    tekst: Joi.string().required(),
    type: Joi.string().required(),
    order_id: Joi.number().integer().positive()
  })
};

const wijzigStatus = async (ctx) => {
  const { status } = ctx.request.body;

  const companyId = await userService.getCompanyIdByUserId(ctx.state.session.userId);
  const numRowsUpdated = await notificationService.wijzigStatus(ctx.request.params.id, status, companyId);
  
  ctx.status = 200;
  ctx.body = numRowsUpdated;
};

wijzigStatus.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
  body: Joi.object({
    status: Joi.string().required()
  }),
};

const getTotalOnreadMessages = async (ctx) => {
  const {userId, rol} = ctx.state.session;
  const companyId = await userService.getCompanyIdByUserId(userId);
  
  const totalMessages = await notificationService.getTotalOnread(companyId, rol);

  ctx.status = 200;
  ctx.body = totalMessages;
};

module.exports = function installHealthRoutes(app) {
  const router = new Router({
    prefix: '/notificaties',
  });
  
  const requireAdmin = makeRequireRole(Role.ADMIN);
  const requireLeverancier = makeRequireRole(Role.LEVERANCIER);
  const requireKlant = makeRequireRole(Role.KLANT);

  router.get('/', requireAuthentication, requireAdmin, validatie(getAllNotifications.validationScheme), getAllNotifications);

  router.get('/leverancier', requireAuthentication, requireLeverancier, validatie(getByLeverancier.validationScheme), getByLeverancier);

  router.get('/klant', requireAuthentication, requireKlant, validatie(getByLeverancier.validationScheme), getByKlant);

  router.put('/:id', requireAuthentication, validatie(wijzigStatus.validationScheme), wijzigStatus);

  router.post('/', requireAuthentication, validatie(createNotification.validationScheme), createNotification);

  router.get('/ongelezen', requireAuthentication, getTotalOnreadMessages);

  app.use(router.routes()).use(router.allowedMethods());
};