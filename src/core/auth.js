const userService = require('../service/user');

const requireAuthentication = async (ctx, next) => {
  const { authorization } = ctx.headers;

  const { authToken, ...session } = await userService.checkAndParseSession(
    authorization,
  );

  ctx.state.session = session;
  ctx.state.authToken = authToken;

  return next();
};

const makeRequireRole = (userRole) => async (ctx, next) => {
  const { rol = null} = ctx.state.session;
  userService.checkRole(userRole, rol);
  return next();
};

module.exports = {
  requireAuthentication,
  makeRequireRole,
};
