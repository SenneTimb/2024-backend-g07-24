/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const config = require('config');

const userRepository = require('../repository/user');
const orderRepository = require('../repository/order');
const transporter = require('../core/email');
const notificationsRepository = require('../repository/notifications');
const ServiceError = require('../core/serviceError');
const Rol = require('../core/rollen');
const { getSocket } = require('../core/socket');
const notificaties = require('../core/notificaties');
const betalingsstatus = require('../core/betalingsstatus');

const handleDBError = require('./_handleDBError');
const orderService = require('./order');

const getAllOrders = async () => {
  const notifications = await notificationsRepository.getAllNotifications();
  if (!notifications) {
    throw ServiceError.notFound('No notifications found');
  }
  return notifications;
};

const getByLeverancier = async (leverancierId, withLimit) => {
  const notifications = await notificationsRepository.getByLeverancier(leverancierId, withLimit);

  if (!notifications) {
    throw ServiceError.notFound('No notifications found');
  }
  return notifications;
};
  
  const getByKlant = async (klantId, withLimit) => {
  const notifications = await notificationsRepository.getByKlant(klantId, withLimit);
    if (!notifications) {
      throw ServiceError.notFound('No notifications found');
    }
    return notifications;
};

const getTotalOnread = async (userId, rol) => {
  if(rol == Rol.KLANT) {
    return notificationsRepository.getTotalOnreadKlant(userId);
  }

  return notificationsRepository.getTotalOnreadLeverancier(userId);
};

const create = async (tekst, type, order_id, rol) => {
  try {

    if(type === notificaties.BETALINGSVERZOEK) {
      const order = await orderService.getOrderById(order_id);
      const orderUser = await orderService.getOrderUserById(order_id, rol);
      
      if(order.betalingsstatus === betalingsstatus.BETAALD) throw ServiceError.forbidden('U kunt geen notificatie sturen als bestelling betaald is');

      const order2 = await orderRepository.getOrderById(order_id);
      const user = await userRepository.findById(orderUser.userId);

      const mailOptions = {
        from: config.get('email.senderEmail'),
        to: user.email,
        subject: 'Nieuwe notificatie',
        html: `
        <p>Beste ${user.bedrijfNaam},</p>
  
        <p>U heeft een nieuwe notificatie ontvangen met betrekking tot bestelling ${order.ordernummer}:</p>
        <p>Uw bestelling is nog niet betaald.</p>
  
        <p>Met vriendelijke groeten,</p>
        <p>${order2.leverancier}</p>
        `,
      };
  
      const mailTransporter = await transporter;
      await mailTransporter.sendMail(mailOptions);
    }
    // console.log(type);
    const id = await notificationsRepository.create({
      tekst,
      type,
      status: 'ongelezen',
      date: new Date(),
      order_id,
    });

    const order = await orderService.getOrderUserById(order_id, rol);
    const notification = await notificationsRepository.getById(id);

    getSocket().to(order.userId).emit('message', notification);
    
    return notification;
  } catch (error) {

    console.error(error);

    throw handleDBError(error);
  }
};

const wijzigStatus = async (notificationId, status, userId) => {
  const notificatie = await notificationsRepository.getById(notificationId);

  if(!notificatie) {
    throw ServiceError.notFound(`Notification with ID ${notificationId} not found`);
  }
  const numUpdatedRows = await notificationsRepository.wijzigStatus(notificationId, status, userId);

  return numUpdatedRows;
};


module.exports = { getAllOrders, getByLeverancier, getByKlant, wijzigStatus, getTotalOnread, create};