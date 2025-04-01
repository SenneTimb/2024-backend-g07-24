/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const herinneringRepository = require('../repository/herinnering');
const ServiceError = require('../core/serviceError');



const getLaatsteBetalingsherinnering = async (orderId) => {
  const herinneringen = await herinneringRepository.getLaatsteBetalingsherinnering(orderId);
  if (!herinneringen) {
    throw ServiceError.notFound(`Betalingsherinnering met ID ${orderId} niet gevonden`);
  }
  return herinneringen;
};


module.exports = { getLaatsteBetalingsherinnering };