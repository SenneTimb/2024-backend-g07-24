const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.alterTable(tables.bestelling, (table) => {
      table.dropColumn('UUIDCode');
      table.string('ordernummer');
    });
  },
  down: (knex) => {
    return knex.schema.alterTable(tables.bestelling, (table) => {
      table.dropColumn('ordernummer');
    });
  },
};