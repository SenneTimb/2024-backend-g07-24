const { tables } = require('../../src/data');
const { testAuthHeader } = require('../common/auth');
const { withServer, loginLeverancier } = require('../supertest.setup');

describe('Companies', () => { 
  
  let request, knex, authHeaderLeverancier;

  withServer(({
    supertest,
    knex: k,
  }) => {
    request= supertest;
    knex= k;
  });

  beforeAll(async () => {
    authHeaderLeverancier = await loginLeverancier(request);
  });

  const url = '/api/bedrijven';

  describe('GET /api/bedrijven', () => { 
    test('should 200 and return bedrijven', async () => { 
      const response = await request.get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].id).toBeTruthy();
    });

    test('should 400 with invalid query', async () => {
      const response = await request.get(`${url}?invalid=true`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });
  });
  describe('GET /api/bedrijven/:id', () => { 
    
    test('should 200 and return bedrijf', async () => { 
      const response = await request.get(`${url}/1`).set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.naam).toBe('TechSolutions');
    });
    
    testAuthHeader(() => request.get(`${url}/1`));

    test('should 404 when not existing bedrijf', async () => {
      const response = await request.get(`${url}/99`).set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('Bedrijf met ID 99 niet gevonden');
    });

    test('should 400 when invalid id', async () => {
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });
  describe('PUT /api/bedrijven/:id', () => { 
    let dataChanged = {
      ids: [],
      data: { ADRES: '123 Tech Street' },
    };

    afterAll(async () => {
      await knex(tables.bedrijf).whereIn('BEDRIJFID', dataChanged.ids).update(dataChanged.data);
    });

    test('should 200 and update bedrijf', async () => {
      const response = await request.put(`${url}/3`)
        .set('Authorization', authHeaderLeverancier)
        .send({
          adres: 'Street One',
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(1);
    
      dataChanged.ids.push(3);
    });

    testAuthHeader(() => request.put(`${url}/3`));

    test('should 403 when updating with unauthorized user', async () => {
      const response = await request.put(`${url}/1`).set('Authorization', authHeaderLeverancier)
        .send({
          adres: 'Street One',
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    test('should 400 when invalid id', async () => {
      const response = await request.put(`${url}/invalid`)
        .set('Authorization', authHeaderLeverancier)
        .send({
          adres: 'Street One',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });

    test('should 400 with missing adres', async () => {
      const response = await request.put(`${url}/3`)
        .set('Authorization', authHeaderLeverancier)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('adres');
    });
  });
});