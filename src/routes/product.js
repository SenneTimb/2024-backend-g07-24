/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
const Router = require('@koa/router');
const Joi = require('joi');

const { makeRequireRole } = require('../core/auth');
const Role = require('../core/rollen');

const validatie = require('../core/validation');
const productService = require('../service/products');

const getAllProducts = async (ctx) => {
  const products = await productService.getAllProducts(ctx.request.query.pagina);

  ctx.status = 200;
  ctx.body = products;
};

getAllProducts.validationScheme = {
  query: Joi.object({
    pagina: Joi.number().integer()
  })
};

const getProductById = async (ctx) => {
  const { id } = ctx.params;
  const product = await productService.getProductById(id);

  ctx.status = 200;
  ctx.body = product;
};

getProductById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Install producten routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installHealthRoutes(app) {
  const router = new Router({
    prefix: '/producten',
  });

  const requireAdmin = makeRequireRole(Role.ADMIN);
  const requireLeverancier = makeRequireRole(Role.LEVERANCIER);
  const requireKlant = makeRequireRole(Role.KLANT);

  // producten opvragen van een bestelling
  
  // router.get('/:orderId', requireAuthentication, validatie(getProductByOrder.validationScheme), getProductByOrder);
  router.get('/', validatie(getAllProducts.validationScheme), getAllProducts);
  router.get('/:id', validatie(getProductById.validationScheme), getProductById);

  app.use(router.routes()).use(router.allowedMethods());
};