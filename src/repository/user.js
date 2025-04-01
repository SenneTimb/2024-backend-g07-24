const { ADMIN } = require('../core/rollen');
const {getKnex, tables} = require('../data');

const makeUser = ({ GEBRUIKERID, EMAIL, ISACTIEF, WACHTWOORD, ROL, bedrijfId, NAAM, 
  SECTOR, BTWNUMMER, ADRES, last_login, passResetCode, passResetExpDate }) => ({
  id: GEBRUIKERID,
  email: EMAIL,
  wachtwoord: WACHTWOORD,
  isActief: ISACTIEF, 
  rol: ROL,
  last_login,
  bedrijfId: bedrijfId,
  bedrijfNaam: NAAM,
  bedrijfSector: SECTOR,
  bedrijfBTW: BTWNUMMER,
  bedrijfAdres: ADRES,
  passResetCode,
  passResetExpDate,
});

const findByEmailAndRol = async (email, rol) => {
  let user;

  if(rol === ADMIN) {
    user = await getKnex()(tables.gebruiker)
      .where('email', email).andWhere('rol', rol).first();
  } else {
    user = await getKnex()(tables.gebruiker)
      .join(
        tables.bedrijf + ' as bedrijf',
        `${tables.gebruiker}.bedrijfId`,
        '=',
        'bedrijf.BEDRIJFID',
      )
      .where('email', email).andWhere('rol', rol).first();
  }

  return user ? makeUser(user) : undefined;
};

const generateResetCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const findById = async (id) => {

  console.log(id);

  const user = await getKnex()(tables.gebruiker)
    .join(
      tables.bedrijf + ' as bedrijf',
      `${tables.gebruiker}.bedrijfId`,
      '=',
      'bedrijf.BEDRIJFID',
    ).where(`${tables.gebruiker}.GEBRUIKERID`, '=', id).first();
  return user ? makeUser(user) : undefined;
};

const findCompanyIdByUserId = async(userId) =>{
  const user = await findById(userId);
  const companyId = user.bedrijfId;
  return companyId;
};

const logLastLogin = async (loggedTime, userId) => {
  try {
    const updateResult = await getKnex()(tables.gebruiker)
      .where(`${tables.gebruiker}.GEBRUIKERID`, '=', userId) 
      .update({
        last_login: loggedTime,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {
    console.error('Failed to update gebruiker login time:', error);
    throw error;
  }
};

const wijzigEmail = async (email, userId) => {
  try {
    const updateResult = await getKnex()(tables.gebruiker)
      .where({ GEBRUIKERID: userId})
      .update({
        EMAIL: email,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {

    console.error('Failed to update user email:', error);
    throw error; 
  }
};

const updatePasswordReset = async (userId, resetCode, resetExpiry) => {
  try {
    const updateResult = await getKnex()(tables.gebruiker)
      .where('GEBRUIKERID', userId)
      .update({
        passResetCode: resetCode,
        passResetExpDate: resetExpiry,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {
    console.error('Error updating password reset:', error);
    throw error;
  }
};

const findByResetCode = async (resetCode) => {
  try {
    const user = await getKnex()(tables.gebruiker)
      .where({ passResetCode: resetCode })
      .first();
    return user ? makeUser(user) : undefined;
  } catch (error) {
    console.error('Error finding user by reset code:', error);
    throw new Error('Error finding user by reset code');
  }
};

const updatePassword = async (userId, hashedPassword) => {
  try {
    const updateResult = await getKnex()(tables.gebruiker)
      .where('GEBRUIKERID', userId)
      .update({
        WACHTWOORD: hashedPassword,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

const clearPasswordReset = async (userId) => {
  try {
    const updateResult = await getKnex()(tables.gebruiker)
      .where('GEBRUIKERID', userId)
      .update({
        passResetCode: null,
        passResetExpDate: null,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {
    console.error('Error clearing password reset:', error);
    throw error;
  }
};

module.exports = {findByEmailAndRol, findById, findCompanyIdByUserId, logLastLogin, wijzigEmail, 
  updatePasswordReset, findByResetCode, updatePassword, clearPasswordReset, generateResetCode};