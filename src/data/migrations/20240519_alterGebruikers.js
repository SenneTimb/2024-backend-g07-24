const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.alterTable(tables.gebruiker, (table) => {
      table.string('passResetCode').nullable();
      table.dateTime('passResetExpDate').nullable();
    });
  },
  down: (knex) => {
    return knex.schema.alterTable(tables.gebruiker, (table) => {
      table.dropColumn('passResetCode');
      table.dropColumn('passResetExpDate');
    });
  },
};