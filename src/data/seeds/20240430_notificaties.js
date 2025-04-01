const { tables } = require('..');
const notifType = require('../../core/notificaties');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.notificatie).delete();

    // then add the fresh places
    await knex(tables.notificatie).insert([
      {notificatieId: 1, date: new Date(), tekst: 'Betalings herrinering', type: notifType.BETALINGSVERZOEK, status: 'ongelezen', order_id: 1},
      {notificatieId: 2, date: new Date(), tekst: 'Betaling ontvangen', type: notifType.BETALING_ONTVANGEN, status: 'ongelezen', order_id: 2},
      {notificatieId: 3, date: new Date(), tekst: 'Bestelling klaar voor verzenden', type: notifType.KLAAR_VERZENDING, status: 'ongelezen', order_id: 2},
    ]);
  },
};