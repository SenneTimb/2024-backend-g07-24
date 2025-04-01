const config = require('config');

const { initializeLogger } = require('../src/core/logging');
// const Role = require('../src/core/rollen');
const { initializeData } = require('../src/data');

module.exports = async () => {

  initializeLogger({
    level: config.get('log.level'),
    disabled: config.get('log.disabled'),
  });

  await initializeData();

  // const knex = getKnex();
  // Er zijn al verschillende gebruikers aanwezig
  // await knex(tables.gebruiker).insert([
  //   {
  //     GEBRUIKERID: 1,
  //     EMAIL: 'leverancier@test.com',
  //     WACHTWOORD: '1234',
  //     ROL: 1,
  //     ISACTIEF: 1,
  //     B_BEDRIJFID: 1,
  //   },
  // ]);

};