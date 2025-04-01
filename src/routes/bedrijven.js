const Router = require('@koa/router');
const Joi = require('joi');

const validatie = require('../core/validation');
const companyService = require('../service/company');
const userService = require('../service/user');
const { requireAuthentication } = require('../core/auth');

const getById = async (ctx) => {
  const company = await companyService.getCompanyById(ctx.params.id);

  ctx.status = 200;
  ctx.body = company;
};

getById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const getAllCompanies = async (ctx) => {
  const companies = await companyService.getAllCompanies();

  ctx.status = 200;
  ctx.body = companies;
};

getAllCompanies.validationScheme = {
  params: Joi.object({}),
};

const wijzigBedrijf= async (ctx) => {
  console.log(ctx.request.body);
  const { adres } = ctx.request.body;
  const numRowsUpdated = await companyService.wijzigAdres(adres, ctx.request.params.id);
  
  ctx.status = 200;
  ctx.body = numRowsUpdated;
};

wijzigBedrijf.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  body: Joi.object({
    adres: Joi.string().required(),
  }),
};

const checkBedrijfId = async (ctx, next) => {
  const { userId } = ctx.state.session;
  const { id } = ctx.request.params;

  const user = await userService.getUserById(userId);

  // You can only get our own data unless you're an admin
  if (Number(id) !== user.bedrijfId) {
    return ctx.throw(
      403,
      'Je bent niet bevoegd om deze gebruiker zijn info te zien',
      {
        code: 'FORBIDDEN',
      },
    );
  }
  return next();
};

/**
 * Install health routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installHealthRoutes(app) {
  const router = new Router({
    prefix: '/bedrijven',
  });

  router.get('/', validatie(getAllCompanies.validationScheme), getAllCompanies);
  router.get('/:id', requireAuthentication, validatie(getById.validationScheme), getById);
  router.put('/:id', requireAuthentication, validatie(wijzigBedrijf.validationScheme), checkBedrijfId, wijzigBedrijf);

  app.use(router.routes()).use(router.allowedMethods());
};