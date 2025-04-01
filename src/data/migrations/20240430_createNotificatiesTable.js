const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.notificatie, (table) => {
      table.increments('notificatieId').primary();
      table.datetime('date').notNullable();
      table.string('tekst', 255).notNullable();
      table.enu('type', ['betalingsverzoek', 'betalingOntvangen', 'klaarVerzending']).notNullable();
      table.enu('status', ['gelezen', 'ongelezen']).notNullable();
      table.integer('order_id').notNullable();
      table
        .foreign('order_id', 'fk_notificatie_order')
        .references(`${tables.bestelling}.orderid`)
        .onDelete('CASCADE');
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.notificatie);
  },
};