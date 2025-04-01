const companyRepository = require('../repository/company');
const ServiceError = require('../core/serviceError');


const getCompanyById = async (id) => { 
  const company = await companyRepository.findById(id);

  if(!company) {
    throw ServiceError.notFound(`Bedrijf met ID ${id} niet gevonden`, { id });
  }
  return company;
};

const getAllCompanies = async () => {
  const companies = await companyRepository.findAllCompanies();
  if (!companies) {
    throw ServiceError.notFound('No companies found');
  }
  return companies;
};


const wijzigAdres = async (adres, bedrijfId) => {
  const numUpdatedRows = await companyRepository.wijzigAdres(adres, bedrijfId);
  if (numUpdatedRows < 1) {
    throw ServiceError.notFound(`Bedrijf met ${bedrijfId} niet gevonden`);
  }
  return numUpdatedRows;
};



module.exports = { getCompanyById, getAllCompanies, wijzigAdres};