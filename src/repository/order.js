/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint-disable max-len */
const rollen = require('../core/rollen');
const {getKnex, tables} = require('../data');

const makeOrder = ({ ORDERID, BETALINGSDEADLINE, BETALINGSSTATUS, DATUMGEPLAATST, LEVERADRES, ORDERSTATUS, klant, leverancier, ordernummer}) => ({
  id: ORDERID,
  betalingsdeadline: BETALINGSDEADLINE,
  betalingsstatus: BETALINGSSTATUS,
  datumgeplaatst: DATUMGEPLAATST, 
  leveradres: LEVERADRES,
  orderstatus: ORDERSTATUS,
  klant: klant,
  leverancier: leverancier,
  ordernummer: ordernummer
});

const ITEMS_PER_PAGE = 50;

const SELECT_COLUMNS = [
    `${tables.bestelling}.ORDERID`,
    `${tables.bestelling}.BETALINGSDEADLINE`,
    `${tables.bestelling}.BETALINGSSTATUS`,
    `${tables.bestelling}.DATUMGEPLAATST`,
    `${tables.bestelling}.LEVERADRES`,
    `${tables.bestelling}.ORDERSTATUS`,
    `${tables.bestelling}.ordernummer`,
    'klantbedrijf.NAAM as klant',  // Use the alias in the select clause
    'leverancierbedrijf.NAAM as leverancier'  // Use the alias in the select clause
  ];
  

const getAllOrders = async () => {
    const orders = await getKnex()(tables.bestelling)
      .join(
        tables.bedrijf + ' as klantbedrijf',  // Alias for the first join
        `${tables.bestelling}.klantId`,
        '=',
        'klantbedrijf.BEDRIJFID'
      )
      .join(
        tables.bedrijf + ' as leverancierbedrijf',  // Alias for the second join
        `${tables.bestelling}.leverancierId`,
        '=',
        'leverancierbedrijf.BEDRIJFID'
      )
      .select(SELECT_COLUMNS);
  
    return orders.map(makeOrder);
  };


  const getByLeverancier = async (leverancierId) => {
    const orders = await getKnex()(tables.bestelling)
      .join(
        tables.bedrijf + ' as klantbedrijf',
        `${tables.bestelling}.klantId`,
        '=',
        'klantbedrijf.BEDRIJFID'
      )
      .join(
        tables.bedrijf + ' as leverancierbedrijf',  
        `${tables.bestelling}.leverancierId`,
        '=',
        'leverancierbedrijf.BEDRIJFID'
      )
      .where(`${tables.bestelling}.leverancierId`, '=', leverancierId) 
      .select(SELECT_COLUMNS);

    return orders.map(makeOrder);
};

const getByKlant = async (klantId) => {
    const orders = await getKnex()(tables.bestelling)
      .join(
        tables.bedrijf + ' as klantbedrijf', 
        `${tables.bestelling}.klantId`,
        '=',
        'klantbedrijf.BEDRIJFID'
      )
      .join(
        tables.bedrijf + ' as leverancierbedrijf', 
        `${tables.bestelling}.leverancierId`,
        '=',
        'leverancierbedrijf.BEDRIJFID'
      )
      .where(`${tables.bestelling}.klantId`, '=', klantId) 
      .select(SELECT_COLUMNS);

    return orders.map(makeOrder);
};

const getOrderById = async (orderId) => {
  const order = await getKnex()(tables.bestelling)
    .join(
      tables.bedrijf + ' as klantbedrijf',
      `${tables.bestelling}.klantId`,
      '=',
      'klantbedrijf.BEDRIJFID'
    )
    .join(
      tables.bedrijf + ' as leverancierbedrijf',
      `${tables.bestelling}.leverancierId`,
      '=',
      'leverancierbedrijf.BEDRIJFID'
    )
    .where(`${tables.bestelling}.ORDERID`, '=', orderId)
    .select(SELECT_COLUMNS)
    .first();

  return order ? makeOrder(order) : null;
};

const makeUserOrder = ({ GEBRUIKERID}) => ({
  userId: GEBRUIKERID 
});

const getOrderKlantById = async (orderId) => {
  const order = await getKnex()(tables.bestelling)
    .join(
      tables.gebruiker + ' as klant',
      `${tables.bestelling}.klantId`,
      '=',
      'klant.bedrijfId'
    )
    .where(`${tables.bestelling}.ORDERID`, '=', orderId)
    .andWhere('klant.ROL', '=', rollen.KLANT)
    .select([
      'klant.GEBRUIKERID'
    ])
    .first();

    return makeUserOrder(order);
};

const getOrderLeverancierById = async (orderId) => {
  const order = await getKnex()(tables.bestelling)
    .join(
      tables.gebruiker + ' as leverancier',
      `${tables.bestelling}.leverancierId`,
      '=',
      'leverancier.bedrijfId'
    )
    .where(`${tables.bestelling}.ORDERID`, '=', orderId)
    .andWhere('leverancier.ROL', '=', rollen.LEVERANCIER)
    .select([
      'leverancier.GEBRUIKERID'
    ])
    .first();

    return makeUserOrder(order);
};

const wijzigStatusen = async (orderId, betalingsstatus, orderstatus) => {
  try {
    const updateResult = await getKnex()(tables.bestelling)
      .where({ ORDERID: orderId }) // Match the order by ID
      .update({
        BETALINGSSTATUS: betalingsstatus,
        ORDERSTATUS: orderstatus
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {

    console.error('Failed to update order statuses:', error);
    throw error; 
  }
};

const betaalOrder = async (orderId, betalingsstatus) => {
  try {
    const updateResult = await getKnex()(tables.bestelling)
      .where({ ORDERID: orderId }) // Match the order by ID
      .update({
        BETALINGSSTATUS: betalingsstatus,
      });

    if (updateResult === 0) {
      throw new Error('Geen records updated');
    }

    return updateResult;
  } catch (error) {

    console.error('Failed to update order statuses:', error);
    throw error; 
  }
};

const getOrdersByPaginaByLeverancier = async (leverancierId, pagina, filterBy, filterWaarde, orderBy, orderWaarde) => {
  const offset = (pagina - 1) * ITEMS_PER_PAGE;
  const allOrders = await getByLeverancier(leverancierId);
  const orders = await getKnex()(tables.bestelling)
      .join(
        tables.bedrijf + ' as klantbedrijf',
        `${tables.bestelling}.klantId`,
        '=',
        'klantbedrijf.BEDRIJFID'
      )
      .join(
        tables.bedrijf + ' as leverancierbedrijf',  
        `${tables.bestelling}.leverancierId`,
        '=',
        'leverancierbedrijf.BEDRIJFID'
      )
      .where(`${tables.bestelling}.leverancierId`, '=', leverancierId) 
      .where(`${filterBy === 'klant' ? 'klantbedrijf.NAAM' : `${tables.bestelling}.${filterBy}`}`, 'like', `%${filterWaarde || ''}%`)
      .select(SELECT_COLUMNS)
      .orderBy(orderBy, orderWaarde)
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return {bestellingen: orders.map(makeOrder), lengthAllOrders: allOrders.length};
};

const getOrdersByPaginaByKlant = async (klantId, pagina, filterBy, filterWaarde, orderBy, orderWaarde) => {
  
  const offset = (pagina - 1) * ITEMS_PER_PAGE;
  const allOrders = await getByKlant(klantId);
  const orders = await getKnex()(tables.bestelling)
      .join(
        tables.bedrijf + ' as klantbedrijf',
        `${tables.bestelling}.klantId`,
        '=',
        'klantbedrijf.BEDRIJFID'
      )
      .join(
        tables.bedrijf + ' as leverancierbedrijf',  
        `${tables.bestelling}.leverancierId`,
        '=',
        'leverancierbedrijf.BEDRIJFID'
      )
      .where(`${tables.bestelling}.klantId`, '=', klantId) 
      .where(`${filterBy === 'leverancier' ? 'leverancierbedrijf.NAAM' : `${tables.bestelling}.${filterBy}`}`, 'like', `%${filterWaarde || ''}%`)
      .select(SELECT_COLUMNS)
      .orderBy(orderBy, orderWaarde)
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

  return {bestellingen: orders.map(makeOrder), lengthAllOrders: allOrders.length};  
};

  
module.exports = {getAllOrders, getByLeverancier, getByKlant,
   getOrderById, wijzigStatusen, getOrderKlantById, getOrderLeverancierById,
   betaalOrder, getOrdersByPaginaByLeverancier, getOrdersByPaginaByKlant};