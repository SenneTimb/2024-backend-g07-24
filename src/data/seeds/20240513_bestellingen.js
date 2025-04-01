const { v4: uuidv4 } = require('uuid');

const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    const orders = await knex(tables.bestelling).select();

    for (const order of orders) {
      await knex(tables.bestelling)
        .where('ORDERID', order.ORDERID)
        .update({ ordernummer: uuidv4().substring(0, 8) });
    }
  },
};