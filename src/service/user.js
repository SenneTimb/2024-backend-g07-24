
const config = require('config');

const transporter = require('../core/email');
const userRepository = require('../repository/user');
const { generateJWT, verifyJWT } = require('../core/jwt');
const ServiceError = require('../core/serviceError');
const { getLogger } = require('../core/logging');
const { ADMIN, KLANT, LEVERANCIER } = require('../core/rollen');
const { verifyPassword } = require('../core/password');
const { hashPassword } = require('../core/password');


const handleDBError = require('./_handleDBError');

const checkAndParseSession = async (authHeader) => {

  if (!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  } 

  if (!authHeader.startsWith('Bearer ')) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }

  const authToken = authHeader.substring(7);
  try {
    const { rol, userId } = await verifyJWT(authToken);


    return {
      userId,
      rol,
      authToken,
    };
  } catch (error) {
    getLogger().error(error.message, { error });
    throw new Error(error.message);
  }
};

const checkRole = (rol, userRol) => {
  const hasPermission = userRol === rol;

  if (!hasPermission) {
    throw ServiceError.forbidden(
      'U bent niet bevoegd om dit deel van de applicatie te bekijken',
    );
  }
};

const makeExposedUser = ({ last_login, ...user }) => {
  delete user.wachtwoord;
  return {
    ...user,
    last_login,
  };};


const makeLoginData = async (user) => {
  const token = await generateJWT(user);
  return {
    user: makeExposedUser(user),
    token,
  };
};

const login = async (email, password, rol) => {
  rol = rol.toUpperCase() === 'ADMIN' ? ADMIN : rol.toUpperCase() === 'LEVERANCIER' ? LEVERANCIER : KLANT; 

  const user = await userRepository.findByEmailAndRol(email, rol);

  const matchErrorMessage = 'Het opgegeven e-mailadres en wachtwoord komen niet overeen';

  if(!user) {
    console.log('No user', email, rol);
    throw ServiceError.unauthorized(matchErrorMessage);
  }

  const passwordValid = await verifyPassword(password, user.wachtwoord);
  
  if(!passwordValid) {
    throw ServiceError.unauthorized(matchErrorMessage);
  }

  return await makeLoginData(user);
};

const getUserById = async (id) => { 
  const user = await userRepository.findById(id);

  if(!user) {
    throw ServiceError.notFound(`Er bestaat geen gebruiker met id "${id}"`, { id });
  }

  return makeExposedUser(user); 
};

const getCompanyIdByUserId = async (userId) =>{
  const companyId = await userRepository.findCompanyIdByUserId(userId);

  if(!companyId) {
    throw ServiceError.notFound(`Er bestaat geen bedrijf met id: "${companyId}"`, {companyId });
  }
  return companyId;
  
};

const editLastLogin = async (loggedTime, userId) => {
  try {
    await userRepository.logLastLogin(loggedTime, userId);
  } catch (error) {
    handleDBError(error);
  }
}; 


const wijzigEmail = async (email, userId) => {
  const numUpdatedRows = await userRepository.wijzigEmail(email, userId);
  if (numUpdatedRows < 1) {
    throw ServiceError.notFound(`Gebruiker met ${userId} id niet gevonden`);
  }
  return numUpdatedRows;
};

const initiatePasswordReset = async (email, rol) => {
  rol = rol.toUpperCase() === 'ADMIN' ? ADMIN : rol.toUpperCase() === 'LEVERANCIER' ? LEVERANCIER : KLANT; 
  const user = await userRepository.findByEmailAndRol(email, rol);
  if (!user) {
    throw ServiceError.notFound('Gebruiker niet gevonden');
  }

  const passResetCode = userRepository.generateResetCode();
  const passResetExpDate = new Date(Date.now() + 3600000);
  // passResetExpDate.setHours(passResetExpDate.getHours() + 1);

  await userRepository.updatePasswordReset(user.id, passResetCode, passResetExpDate);

  const URL = config.get('email.frontendUrl');
  const resetUrl = `${URL}/wijzig-wachtwoord/${passResetCode}`; 

  const SENDER_EMAIL = config.get('email.senderEmail');
  const mailOptions = {
    from: SENDER_EMAIL,
    to: email,
    subject: 'Wachtwoord resetten',
    html: `<p>Klik op de volgende link om uw wachtwoord te resetten: <a href="${resetUrl}">${resetUrl}</a></p>`,
  };

  try {
    const mailTransporter = await transporter;
    await mailTransporter.sendMail(mailOptions);
    getLogger().info(`Password reset email sent to ${email}`);
  } catch (error) {
    getLogger().error(`Failed to send password reset email to ${email}: ${error.message}`);
    throw ServiceError.internalServerError('Fout bij het verzenden van de e-mail.');
  }
};

const resetPassword = async (resetCode, newPassword) => {
  const user = await userRepository.findByResetCode(resetCode);
  if (!user || user.passResetExpDate < new Date()) {
    throw ServiceError.unauthorized('Ongeldige of verlopen reset code');
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepository.updatePassword(user.id, hashedPassword);
  await userRepository.clearPasswordReset(user.id);
};

module.exports = { login, checkAndParseSession, checkRole, getUserById,
  getCompanyIdByUserId, editLastLogin, wijzigEmail, initiatePasswordReset, resetPassword};