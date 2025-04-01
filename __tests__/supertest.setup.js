const supertest = require('supertest');

const createServer = require('../src/createServer');
const { getKnex } = require('../src/data');

const loginLeverancier = async (supertest) => {
  const response = await supertest.post('/api/users/login').send({
    email: 'test@test.com',
    password: '1234',
    rol: 'leverancier',
  });

  if(response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }

  return `Bearer ${response.body.token}`;
};

const loginKlant = async (supertest) => {
  const response = await supertest.post('/api/users/login').send({
    email: 'info@medfusion.com',
    password: '1234',
    rol: 'klant',
  });

  if(response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }

  return `Bearer ${response.body.token}`;
};

const loginKlantNotif = async (supertest) => {
  const response = await supertest.post('/api/users/login').send({
    email: 'info@techsolution.com',
    password: '1234',
    rol: 'klant',
  });

  if(response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }

  return `Bearer ${response.body.token}`;
};

const loginAdmin = async (supertest) => {
  const response = await supertest.post('/api/users/login').send({
    email: 'admin@admin.com',
    password: '1234',
    rol: 'admin',
  });

  if(response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }

  return `Bearer ${response.body.token}`;
};

const withServer = (setter) => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    
    setter({
      knex: getKnex(),
      supertest: supertest(server.getApp().callback()),
    });
  });

  afterAll(async () => {
    await server.stop();
  });
};

module.exports = { loginLeverancier, loginKlant, loginKlantNotif, loginAdmin, withServer };