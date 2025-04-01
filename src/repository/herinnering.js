const { getKnex, tables } = require('../data');

const getLaatsteBetalingsherinnering = async (orderId) => {
  const latestBetalingsherinnering = await getKnex()(tables.betalingsherinnering)
    .where('orderId', '=', orderId)
    .orderBy('DATUM', 'desc')
    .first();  

  return latestBetalingsherinnering;
};

module.exports = { getLaatsteBetalingsherinnering };
