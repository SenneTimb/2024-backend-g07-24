/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const orderRepository = require('../repository/order');
const ServiceError = require('../core/serviceError');
const rollen = require('../core/rollen');
const notificaties = require('../core/notificaties');
const { getLogger } = require('../core/logging');
const notificatieService = require('../repository/notifications');
const { getSocket } = require('../core/socket');

const productenService = require('./products');


const getAllOrders = async () => {
  const orders = await orderRepository.getAllOrders();
  if (!orders) {
    throw ServiceError.notFound('No orders found');
  }
  return orders;
};

const getByLeverancier = async (leverancierId, pagina, filterBy, filterWaarde, orderBy, orderWaarde) => {
  const { bestellingen: orders, lengthAllOrders } = await orderRepository
    .getOrdersByPaginaByLeverancier(leverancierId, pagina, filterBy, filterWaarde, orderBy, orderWaarde);
  if (!orders || orders.length === 0) {
    throw ServiceError.notFound('No orders found');
  }

  // Fetch alle products for elke order and en voeg ze toe
  const ordersWithProducts = await Promise.all(orders.map(async (order) => {
    const products = await productenService.getProductByOrder(order.id);
    return { ...order, products };
  }));

  return { bestellingen: ordersWithProducts, lengthAllOrders };
};

const getByKlant = async (klantId, pagina, filterBy, filterWaarde, orderBy, orderWaarde) => {
  const { bestellingen: orders, lengthAllOrders } = await orderRepository
    .getOrdersByPaginaByKlant(klantId, pagina, filterBy, filterWaarde, orderBy, orderWaarde);
  if (!orders || orders.length === 0) {
    throw ServiceError.notFound('No orders found');
  }

  // Fetch alle products for elke order and en voeg ze toe
  const ordersWithProducts = await Promise.all(orders.map(async (order) => {
    const products = await productenService.getProductByOrder(order.id);
    return { ...order, products };
  }));

  return { bestellingen: ordersWithProducts, lengthAllOrders };
};

const getOrderById = async (orderId) => {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) {
    throw ServiceError.notFound(`Order with ID ${orderId} not found`);
  }
  return order;
};

const getOrderUserById = async (orderId, rol) => {

  let order;
  console.log('rol not: ', rol);

  if(rol === rollen.KLANT) {
    order = await orderRepository.getOrderLeverancierById(orderId);
  } else {
    order = await orderRepository.getOrderKlantById(orderId);
  }

  if (!order) {
    throw ServiceError.notFound(`Order with ID ${orderId} not found`);
  }
  return order;
};

const wijzigStatusen = async (orderId, betalingsstatus, orderstatus) => {

  await getOrderById(orderId);

  const numUpdatedRows = await orderRepository.wijzigStatusen(orderId, betalingsstatus, orderstatus);
 
  return numUpdatedRows;
};

const betaalOrder = async (orderId, betalingsstatus, rol) => {
  await getOrderById(orderId);

  const numUpdatedRows = await orderRepository.betaalOrder(orderId, betalingsstatus);

  const id = await notificatieService.create({
    tekst: 'Bestelling is betaald', 
    type: notificaties.BETALING_ONTVANGEN,  
    status: 'ongelezen',
    date: new Date(), 
    order_id: orderId,
  });
  
  const order = await getOrderUserById(orderId, rol);
  const betaalNotification = await notificatieService.getById(id);
  console.log('user to send notification: ' + order.userId);
  getSocket().to(order.userId).emit('message', betaalNotification);

  const producten = await productenService.getProductByOrder(orderId); 

  let inStock = true;

  producten.forEach((product) => {
    if(product.aantal > product.aantalInStock) 
      inStock = false;
  });

  if(inStock) {
    const id = await notificatieService.create({
      tekst: 'Bestelling is klaar voor verzending', 
      type: notificaties.KLAAR_VERZENDING,  
      status: 'ongelezen',
      date: new Date(), 
      order_id: orderId,
    });
    
    const order = await getOrderUserById(orderId, rol);
    const notification = await notificatieService.getById(id);
  
    getSocket().to(order.userId).emit('message', notification);
  }

  return numUpdatedRows;
};


module.exports = { 
  getAllOrders, 
  getByLeverancier, 
  getByKlant, 
  getOrderById, 
  wijzigStatusen, 
  getOrderUserById, 
  betaalOrder,
};