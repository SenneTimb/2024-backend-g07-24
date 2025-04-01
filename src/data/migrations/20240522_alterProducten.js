const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.alterTable(tables.product, (table) => {
      table.integer('bedrijfId');
      table
        .foreign('bedrijfId', 'fk_product_bedrijf')
        .references(`${tables.bedrijf}.BEDRIJFID`)
        .onDelete('CASCADE');
    });
  },
  down: (knex) => {
    return knex.schema.alterTable(tables.product, (table) => {
      table.dropColumn('bedrijfId');
      table.dropForeign(['fk_product_bedrijf']);
    });
  },
};