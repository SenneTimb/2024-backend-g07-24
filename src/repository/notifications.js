const { getKnex, tables } = require('../data');
const notificatieTypes = require('../core/notificaties');
const { getLogger } = require('../core/logging');

const makeNotification = ({
  notificatieId,
  date,
  tekst,
  type,
  status,
  ORDERID, 
  BETALINGSDEADLINE, 
  BETALINGSSTATUS, 
  DATUMGEPLAATST, 
  LEVERADRES, 
  ORDERSTATUS, 
  klant, 
  leverancier,
}) => ({
  notificatieId,
  date,
  tekst,
  type,
  status,
  bestelling: {
    id: ORDERID,
    betalingsdeadline: BETALINGSDEADLINE,
    betalingsstatus: BETALINGSSTATUS,
    datumgeplaatst: DATUMGEPLAATST, 
    leveradres: LEVERADRES,
    orderstatus: ORDERSTATUS,
    klant: klant,
    leverancier: leverancier,
  },
});

const getAllNotifications = async () => {
  return await getKnex()(tables.notificatie).select();
};

const SELECT_COLUMNS = [
  `${tables.notificatie}.notificatieId`,
  `${tables.notificatie}.date`,
  `${tables.notificatie}.tekst`,
  `${tables.notificatie}.type`,
  `${tables.notificatie}.status`,
  'order.ORDERID',
  'order.BETALINGSDEADLINE',
  'order.BETALINGSSTATUS',
  'order.DATUMGEPLAATST',
  'order.LEVERADRES',
  'order.ORDERSTATUS',
  'klantbedrijf.NAAM as klant',  // Use the alias in the select clause
  'leverancierbedrijf.NAAM as leverancier',  // Use the alias in the select clause
];

const getById = async (notificatieId) => {

  const notification = await getKnex()(tables.notificatie)
    .join(
      tables.bestelling + ' as order',
      `${tables.notificatie}.order_id`,
      '=',
      'order.ORDERID',
    )
    .join(
      tables.bedrijf + ' as klantbedrijf',
      'order.klantId',
      '=',
      'klantbedrijf.BEDRIJFID',
    )
    .join(
      tables.bedrijf + ' as leverancierbedrijf',  
      'order.leverancierId',
      '=',
      'leverancierbedrijf.BEDRIJFID',
    )
    .where(`${tables.notificatie}.notificatieId`, '=', notificatieId)
    .select(SELECT_COLUMNS)
    .first();

  return notification ? makeNotification(notification) : null;
};

const getByLeverancier = async (leverancierId, withLimit) => {

  const notifications = await getKnex()(tables.notificatie)
    .join(
      tables.bestelling + ' as order',
      `${tables.notificatie}.order_id`,
      '=',
      'order.ORDERID',
    )
    .join(
      tables.bedrijf + ' as klantbedrijf',
      'order.klantId',
      '=',
      'klantbedrijf.BEDRIJFID',
    )
    .join(
      tables.bedrijf + ' as leverancierbedrijf',  
      'order.leverancierId',
      '=',
      'leverancierbedrijf.BEDRIJFID',
    )
    .where('order.leverancierId', '=', leverancierId)
    .andWhere(`${tables.notificatie}.type`, '!=', notificatieTypes.BETALINGSVERZOEK)
    .orderBy('date', 'desc')
    .offset(0)
    .limit(withLimit ? 5 : null)
    .select(SELECT_COLUMNS);

  return notifications.map(makeNotification);
};

const getByKlant = async (klantId, withLimit) => {

  const notifications = await getKnex()(tables.notificatie)
    .join(
      tables.bestelling + ' as order',
      `${tables.notificatie}.order_id`,
      '=',
      'order.ORDERID',
    )
    .join(
      tables.bedrijf + ' as klantbedrijf',
      'order.klantId',
      '=',
      'klantbedrijf.BEDRIJFID',
    )
    .join(
      tables.bedrijf + ' as leverancierbedrijf',  
      'order.leverancierId',
      '=',
      'leverancierbedrijf.BEDRIJFID',
    )
    .where('order.klantId', '=', klantId)
    .andWhere(`${tables.notificatie}.type`, '=', notificatieTypes.BETALINGSVERZOEK)
    .orderBy('date', 'desc')
    .offset(0)
    .limit(withLimit ? 5 : null)
    .select(SELECT_COLUMNS);
  return notifications.map(makeNotification);
};

const getTotalOnreadLeverancier = async (leverancierId) => {
  const result = await getKnex()(tables.notificatie)
    .join(
      tables.bestelling + ' as order',
      `${tables.notificatie}.order_id`,
      '=',
      'order.ORDERID',
    )
    .where('order.leverancierId', '=', leverancierId)
    .andWhere(`${tables.notificatie}.type`, '!=', notificatieTypes.BETALINGSVERZOEK)
    .andWhere(`${tables.notificatie}.status`, '=', 'ongelezen')
    .orderBy('date', 'desc')
    .count();

  return {
    total: result[0]['count(*)'],
  };
};

const getTotalOnreadKlant = async (klantId) => {
  const result = await getKnex()(tables.notificatie)
    .join(
      tables.bestelling + ' as order',
      `${tables.notificatie}.order_id`,
      '=',
      'order.ORDERID',
    )
    .where('order.klantId', '=', klantId)
    .andWhere(`${tables.notificatie}.type`, '=', notificatieTypes.BETALINGSVERZOEK)
    .andWhere(`${tables.notificatie}.status`, '=', 'ongelezen')
    .orderBy('date', 'desc')
    .count();

  return {
    total: result[0]['count(*)'],
  };
};

const create = async (item) => {
  try {
    const [id] = await getKnex()(tables.notificatie).insert(item);
    return id;
  } catch (error) {
    getLogger().error('Error in create', { error });
    throw error;
  }
};

const wijzigStatus = async (notificatieId, status) => {
  try {
    // Check if tables and column names are defined correctly
    console.log('Table name for notifications:', tables.notificatie); // Debugging output

    const updateResult = await getKnex()(tables.notificatie)
      .join(
        `${tables.bestelling} as order`, // Ensure this is correctly concatenated
        `${tables.notificatie}.order_id`, // This should be a correct column name
        '=',
        'order.ORDERID',
      )
      .where(`${tables.notificatie}.notificatieId`, '=', notificatieId) // Correctly reference columns
      .update({
        status,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {
    console.error('Failed to update notificatie status:', error);
    throw error; // Rethrow or handle error as needed
  }
};

module.exports = {
  getAllNotifications, 
  getByLeverancier, 
  getByKlant, 
  wijzigStatus,
  getTotalOnreadLeverancier, 
  getTotalOnreadKlant,
  create,
  getById,
};