const notificaties = require('../../src/core/notificaties');
const { tables } = require('../../src/data');
const { testAuthHeader } = require('../common/auth');
const { withServer, loginLeverancier, loginAdmin, loginKlantNotif } = require('../supertest.setup');

describe('Notifications', () => { 
  
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
    authHeaderKlant = await loginKlantNotif(request);
    authHeaderAdmin = await loginAdmin(request);
  });

  const url = '/api/notificaties';

  describe('GET /api/notificaties', () => { 

    test('should 200 and return all the notificaties', async () => { 
      const response = await request.get(`${url}`).set('Authorization', authHeaderAdmin);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].notificatieId).toBe(1);
    });

    testAuthHeader(() => request.get(url));

    test('should 403 when not logged in as an admin', async() => {
      const response = await request.get(`${url}`).set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });
  describe('GET /api/notificaties/leverancier', () => {

    test('should 200 and return the notifications from logged in supplier', async () =>{
      const response = await request.get(`${url}/leverancier?limit=false`).set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].notificatieId).toBe(2);
      expect(response.body[0].type).toBe('betalingOntvangen');
      expect(response.body[1].notificatieId).toBe(3);
      expect(response.body[1].status).toBe('ongelezen');
    });
    
    testAuthHeader(() => request.get(`${url}/leverancier`));

    test('should 403 when logged in as a customer', async () =>{
      const response = await request.get(`${url}/leverancier?limit=false`).set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    test('should 400 when missing limit query', async () => {
      const response = await request.get(`${url}/leverancier`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('limit');
    });
  });
  describe('GET /api/notificaties/klant', () => {

    test('should 200 and return the notifications from logged in customer', async () =>{
      const response = await request.get(`${url}/klant?limit=false`).set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].notificatieId).toBe(1);
    });

    testAuthHeader(() => request.get(`${url}/leverancier`));
    
    test('should 403 when logged in as a supplier', async () =>{
      const response = await request.get(`${url}/klant?limit=false`).set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    test('should 400 when missing limit query', async () => {
      const response = await request.get(`${url}/klant`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('limit');
    });
  });
  describe('GET /api/notificaties/ongelezen', () => {
    test('should 200 and return number of unread messages (supplier)', async () => {
      const response = await request.get(`${url}/ongelezen`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(200);
      expect(response.body.total).toBe(2);
    });

    test('should 200 and return number of unread messages (client)', async () => {
      const response = await request.get(`${url}/ongelezen`)
        .set('Authorization', authHeaderKlant);

      expect(response.statusCode).toBe(200);
      expect(response.body.total).toBe(1);
    });

    testAuthHeader(() => request.get(`${url}/ongelezen`));
  });
  describe('POST /api/notificaties', () => {
    
    let dataToDelete = [];

    afterAll(async () => {
      await knex(tables.notificatie).whereIn('notificatieId', dataToDelete).delete();
    });

    test('should 201 and return created notification', async () => {
      const response = await request.post(url)
        .set('Authorization', authHeaderLeverancier)
        .send({
          tekst: 'ontvangen',
          type: notificaties.BETALING_ONTVANGEN,
          order_id: 1,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.notificatieId).toBeTruthy();
      expect(response.body.tekst).toBe('ontvangen');
      expect(response.body.bestelling.id).toBe(1);

      dataToDelete.push(response.body.notificatieId);
    });

    testAuthHeader(() => request.post(url));
    
    test('should 404 when not existing order', async () => {
      const response = await request.post(url)
        .set('Authorization', authHeaderLeverancier)
        .send({
          tekst: 'ontvangen',
          type: notificaties.BETALING_ONTVANGEN,
          order_id: 99,
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('This order does not exist');
    });

    test('should 400 when missing tekst', async () => {
      const response = await request.post(url).set('Authorization', authHeaderLeverancier)
        .send({
          // tekst: 'ontvangen',
          type: notificaties.BETALING_ONTVANGEN,
          order_id: 1,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('tekst');
    });

    test('should 400 when missing type', async () => {
      const response = await request.post(url).set('Authorization', authHeaderLeverancier)
        .send({
          tekst: 'ontvangen',
          // type: notificaties.BETALING_ONTVANGEN,
          order_id: 1,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('type');
    });

    test('should 400 when missing order_id', async () => {
      const response = await request.post(url).set('Authorization', authHeaderLeverancier)
        .send({
          tekst: 'ontvangen',
          type: notificaties.BETALING_ONTVANGEN,
          // order_id: 1,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('order_id');
    });
  });
  describe('PUT /api/notificaties/status', () => {

    let dataChanged = {
      ids: [],
      data: { status: 'ongelezen' },
    };

    afterAll(() => {
      knex(tables.notificatie).where({notificatieId: dataChanged.ids[0]}).update(dataChanged.data);
    });

    it('should 200 and update notification', async () => {
      const response = await request.put(`${url}/1`).set('Authorization', authHeaderLeverancier)
        .send({
          status: 'gelezen',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body).toBe(1);

      dataChanged.ids.push(1);
    });

    testAuthHeader(() => request.put(`${url}/1`));

    it('should 404 when not existing id', async () => {
      const response = await request.put(`${url}/99`)
        .set('Authorization', authHeaderLeverancier)
        .send({
          status: 'gelezen',
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('Notification with ID 99 not found');
    });

    it('should 400 wanneer invalid id', async () => {
      const response = await request.put(`${url}/status`).set('Authorization', authHeaderLeverancier)
        .send({
          status: 'gelezen',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    it('should 400 wanneer status ontbreekt', async () => {
      const response = await request.put(`${url}/1`).set('Authorization', authHeaderLeverancier)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('status');
    });
  });
});