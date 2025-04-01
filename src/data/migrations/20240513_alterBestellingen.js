const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.alterTable(tables.bestelling, (table) => {
      table.string('UUIDCode');
    });
  },
  down: (knex) => {
    return knex.schema.alterTable(tables.bestelling, (table) => {
      table.dropColumn('UUIDCode');
    });
  },
};  