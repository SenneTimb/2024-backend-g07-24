const { withServer, loginLeverancier, loginKlant, loginAdmin } = require('../supertest.setup');
const { testAuthHeader } = require('../common/auth');
const { tables } = require('../../src/data');

describe('Orders', () => { 
  
  let request, knex, authHeaderLeverancier, authHeaderKlant, authHeaderAdmin;

  withServer(({
    supertest,
    knex: k,
  }) => {
    request= supertest;
    knex = k;
  });

  beforeAll(async () => {
    authHeaderLeverancier = await loginLeverancier(request);
    authHeaderKlant = await loginKlant(request);
    authHeaderAdmin = await loginAdmin(request);
  });

  const url = '/api/bestellingen';

  describe('GET /api/bestellingen', () => { 

    test('should 200 and return all the orders', async () => { 
      const response = await request.get(`${url}`).set('Authorization', authHeaderAdmin);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].id).toBe(1);
    });

    testAuthHeader(() => request.get(`${url}`));

    test('should 403 when not logged in as an admin', async() => {
      const response = await request.get(`${url}`).set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });
  describe('GET /api/bestellingen/klant', () => {

    test('should 200 and return the orders from logged in customer', async () =>{
      const response = await request
        .get(`${url}/klant?pagina=1&filterBy=orderid&filterWaarde=&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(200);
      expect(response.body.bestellingen[0].id).toBe(2);
      expect(response.body.bestellingen[0].klant).toBe('Medfusion Health');
    });
    
    testAuthHeader(() => request.get(`${url}/klant`));

    test('should 403 when logged in as a supplier', async () =>{
      const response = await request.get(`${url}/klant`).set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    // invalid query
    test('should 400 when missing pagina query', async () => { 
      const response = await request
        .get(`${url}/klant?filterBy=orderid&filterWaarde=&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('pagina');
    });

    test('should 400 when missing filterBy query', async () => { 
      const response = await request
        .get(`${url}/klant?pagina=1&filterWaarde=&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('filterBy');
    });

    test('should 400 when missing filterWaarde query', async () => { 
      const response = await request
        .get(`${url}/klant?pagina=1&filterBy=orderid&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('filterWaarde');
    });

    test('should 400 when missing orderBy query', async () => { 
      const response = await request
        .get(`${url}/klant?pagina=1&filterBy=orderid&filterWaarde=&&orderWaarde=asc`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('orderBy');
    });

    test('should 400 when missing orderWaarde query', async () => { 
      const response = await request
        .get(`${url}/klant?pagina=1&filterBy=orderid&filterWaarde=&orderBy=orderid&`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('orderWaarde');
    });
  });
  describe('GET /api/bestellingen/leverancier', () => {

    test('should 200 and return the orders from logged in supplier', async () =>{
      const response = await request
        .get(`${url}/leverancier?pagina=1&filterBy=orderid&filterWaarde=&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(200);
      expect(response.body.lengthAllOrders).toBe(8);
      expect(response.body.bestellingen[0].id).toBe(1);
      expect(response.body.bestellingen[0].leverancier).toBe('TechSolutionsLeverancier');
      expect(response.body.bestellingen[0].klant).toBe('TechSolutions');
      expect(response.body.bestellingen[0].leverancier).toBe('TechSolutionsLeverancier');
    });

    testAuthHeader(() => request.get(`${url}/leverancier`));
    
    test('should 403 when logged in as a customer', async () =>{
      const response = await request.get(`${url}/leverancier`).set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    // invalid query
    test('should 400 when missing pagina query', async () => { 
      const response = await request
        .get(`${url}/leverancier?filterBy=orderid&filterWaarde=&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('pagina');
    });

    test('should 400 when missing filterBy query', async () => { 
      const response = await request
        .get(`${url}/leverancier?pagina=1&filterWaarde=&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('filterBy');
    });

    test('should 400 when missing filterWaarde query', async () => { 
      const response = await request
        .get(`${url}/leverancier?pagina=1&filterBy=orderid&orderBy=orderid&orderWaarde=asc`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('filterWaarde');
    });

    test('should 400 when missing orderBy query', async () => { 
      const response = await request
        .get(`${url}/leverancier?pagina=1&filterBy=orderid&filterWaarde=&&orderWaarde=asc`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('orderBy');
    });

    test('should 400 when missing orderWaarde query', async () => { 
      const response = await request
        .get(`${url}/leverancier?pagina=1&filterBy=orderid&filterWaarde=&orderBy=orderid&`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('orderWaarde');
    });
  });
  describe('GET /api/bestellingen/:id', () => { 
    test('should 200 and return order', async () => { 
      const response = await request.get(`${url}/1`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.leverancier).toBe('TechSolutionsLeverancier');
      expect(response.body.klant).toBe('TechSolutions');
    });

    testAuthHeader(() => request.get(`${url}/1`));

    test('should 404 with not existing order', async () => {
      const response = await request.get(`${url}/99`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('Order with ID 99 not found');
    });

    test('should 400 with invalid order id', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });
  describe('PUT /api/bestellingen/:id', () => { 
    
    const dataChanged = {
      ids: [],
      data: {
        BETALINGSSTATUS: 0,
        ORDERSTATUS: 1,
      },
    };

    afterAll(async () => {
      await knex(tables.bestelling).where({ORDERID: dataChanged.ids[0]})
        .update(dataChanged.data);
    });

    test('should 200 and update order', async () => { 
      const response = await request.put(`${url}/1`).set('Authorization', authHeaderLeverancier)
        .send({
          betalingsstatus: 1,
          orderstatus: 2,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(1);

      dataChanged.ids.push(1);
    });

    testAuthHeader(() => request.put(`${url}/1`));

    test('should 403 when logged in as klant', async () => {
      const response = await request.put(`${url}/1`)
        .set('Authorization', authHeaderKlant)
        .send({
          betalingsstatus: 1,
          orderstatus: 2,
        });
      
      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    test('should 404 with not existing order', async () => {
      const response = await request.put(`${url}/99`)
        .set('Authorization', authHeaderLeverancier)
        .send({
          betalingsstatus: 1,
          orderstatus: 2,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('Order with ID 99 not found');
    });

    test('should 400 when invalid order id', async () => {
      const response = await request.put(`${url}/invalid`)
        .set('Authorization', authHeaderLeverancier)
        .send({
          betalingsstatus: 1,
          orderstatus: 2,
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    test('should 400 when missing betalingsstatus', async () => {
      const response = await request.put(`${url}/1`)
        .set('Authorization', authHeaderLeverancier)
        .send({
          orderstatus: 2,
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('betalingsstatus');
    });

    test('should 400 when missing orderstatus', async () => {
      const response = await request.put(`${url}/1`)
        .set('Authorization', authHeaderLeverancier)
        .send({
          betalingsstatus: 2,
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('orderstatus');
    });
  });
  describe('PUT /api/bestellingen/betaal/:id', () => {
    const dataChanged = {
      ids: [],
      data: {
        BETALINGSSTATUS: 0,
      },
    };

    afterAll(async () => {
      await knex(tables.bestelling).where({ORDERID: dataChanged.ids[0]})
        .update(dataChanged.data);
    });

    test('should 200 and update order', async () => {
      const response = await request.put(`${url}/betaal/1`)
        .set('Authorization', authHeaderKlant)
        .send({ betalingsstatus: 1 });

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(1);

      dataChanged.ids.push(1);
    });

    testAuthHeader(() => request.put(`${url}/betaal/1`));

    test('should 403 when logged in as supplier', async () => {
      const response = await request.put(`${url}/betaal/1`)
        .set('Authorization', authHeaderLeverancier).send({ betalingsstatus: 1 });

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    test('should 404 when not existing order', async () => {
      const response = await request.put(`${url}/betaal/99`)
        .set('Authorization', authHeaderKlant).send({ betalingsstatus: 1 });
    
      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('Order with ID 99 not found');
    });

    test('should 400 when invalid id', async () => {
      const response = await request.put(`${url}/betaal/invalid`)
        .set('Authorization', authHeaderKlant).send({ betalingsstatus: 1 });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');  
    });

    test('should 400 when missing betalingsstatus', async () => {
      const response = await request.put(`${url}/betaal/1`)
        .set('Authorization', authHeaderKlant).send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('betalingsstatus');  
    });
  });
});
