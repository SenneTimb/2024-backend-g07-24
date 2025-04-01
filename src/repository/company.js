const {getKnex, tables} = require('../data');

const makeCompany = ({ BEDRIJFID, BTWNUMMER, ADRES, CONTACTGEGEVENS, LOGO, NAAM, SECTOR }) => ({
  id: BEDRIJFID,
  btwnummer: BTWNUMMER,
  adres: ADRES,
  contactgegevens: CONTACTGEGEVENS, 
  logo: LOGO,
  naam: NAAM,
  sector: SECTOR,
});

const findById = async (id) => {
  const company = await getKnex()(tables.bedrijf).where('BEDRIJFID', id).first();
  return company ? makeCompany(company) : undefined;
};

const findAllCompanies = async () => {
  const companies = await getKnex()(tables.bedrijf).select();
  return companies.map(makeCompany);
};

const wijzigAdres = async (adres, bedrijfId) => {
  try {
    const updateResult = await getKnex()(tables.bedrijf)
      .where({ BEDRIJFID: bedrijfId})
      .update({
        ADRES: adres,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {

    console.error('Failed to update company adres:', error);
    throw error; 
  }
};



module.exports = {findById, findAllCompanies, wijzigAdres};