const Router = require('@koa/router');
const Joi = require('joi');

const validatie = require('../core/validation');
const userService = require('../service/user');
const { requireAuthentication } = require('../core/auth');

const getById = async (ctx) => {
  const user = await userService.getUserById(ctx.params.id);

  ctx.status = 200;
  ctx.body = user;
};

getById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
};

const login = async (ctx) => {
  const {email, password, rol} = ctx.request.body;
  const token = await userService.login(email, password, rol);
  
  ctx.status = 200;
  ctx.body = token;
};

login.validationScheme = {
  body: Joi.object({
    email: Joi.string().email(),
    password: Joi.string(),
    rol: Joi.string().required(),
  }),
};

const logout = async (ctx) => {

  await userService.editLastLogin(new Date(), ctx.state.session.userId);

  ctx.status = 200;
};

const wijzigEmail= async (ctx) => {
  const { email } = ctx.request.body;
  const { id } = ctx.request.params;
  const numRowsUpdated = await userService.wijzigEmail(email, id);
  
  ctx.status = 200;
  ctx.body = numRowsUpdated;
};

wijzigEmail.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive(),
  }),
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

const initiatePasswordReset = async (ctx) => {
  const { email, rol } = ctx.request.body;
  await userService.initiatePasswordReset(email, rol);
  ctx.status = 200;
  ctx.body = { message: 'Wachtwoord reset e-mail verzonden' };
};

initiatePasswordReset.validationScheme = {
  body: Joi.object({
    email: Joi.string().email().required(),
    rol: Joi.string().required(),
  }),
};

const resetPassword = async (ctx) => {
  const { resetCode } = ctx.params;
  const { newPassword } = ctx.request.body;
  await userService.resetPassword(resetCode, newPassword);
  ctx.status = 200;
  ctx.body = { message: 'Wachtwoord succesvol gereset' };
};

resetPassword.validationScheme = {
  params: Joi.object({
    resetCode: Joi.string().required(),
  }),
  body: Joi.object({
    newPassword: Joi.string().min(4).required(),
  }),
};

const checkUserId = async (ctx, next) => {
  const { userId } = ctx.state.session;
  const { id } = ctx.request.params;

  await userService.getUserById(id);

  // You can only get our own data unless you're an admin
  if (Number(id) !== Number(userId)) {
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
 * Install users routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installHealthRoutes(app) {
  const router = new Router({
    prefix: '/users',
  });

  router.get('/:id', requireAuthentication, validatie(getById.validationScheme), getById);
  router.post('/login', validatie(login.validationScheme), login);
  router.put('/:id', requireAuthentication, validatie(wijzigEmail.validationScheme), checkUserId, wijzigEmail);
  router.post('/wijzig-wachtwoord', validatie(initiatePasswordReset.validationScheme), initiatePasswordReset);
  router.put('/wijzig-wachtwoord/:resetCode', validatie(resetPassword.validationScheme), resetPassword);
  router.put('/logout', requireAuthentication, logout);

  app.use(router.routes()).use(router.allowedMethods());
};