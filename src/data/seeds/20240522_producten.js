const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    const products = await knex(tables.product).select();
    const bedrijf = await knex(tables.bedrijf).where({NAAM:'TechSolutionsLeverancier'}).first();

    for (const product of products) {
      await knex(tables.product)
        .where('PRODUCTID', product.PRODUCTID)
        .update({ bedrijfId: bedrijf.BEDRIJFID});
    }
  },
};