const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.alterTable(tables.gebruiker, (table) => {
      table.dateTime('last_login').default(knex.fn.now());
    });
  },
  down: (knex) => {
    return knex.schema.alterTable('<table name>', (table) => {
      table.dropColumn('last_login');
    });
  },
};