
const { withServer, loginLeverancier } = require('../supertest.setup');
const { testAuthHeader } = require('../common/auth');
const { tables } = require('../../src/data');

describe('Users', () => { 
  
  let request, knex, authHeader;

  withServer(({
    supertest,
    knex: k,
  }) => {
    request= supertest;
    knex = k;
  });

  beforeAll(async () => {
    authHeader = await loginLeverancier(request);
  });

  const url = '/api/users';

  describe('GET /api/users/:id', () => { 

    test('should 200 and return user with id', async () => { 
      const response = await request.get(`${url}/6`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe('test@test.com');
    });

    testAuthHeader(() => request.get(`${url}/6`));

    test('should 404 when requesting not existing user', async () => {
      const response = await request.get(`${url}/99`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    test('should 400 when invalid id', async () => { 
      const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });

  describe('PUT /api/user/:id', () => { 
    
    let dataChanged = {
      ids: [],
      data: 'test@test.com',
    };

    afterAll(async () => {
      await knex(tables.gebruiker).where({ GEBRUIKERID: dataChanged.ids[0] }).update({ EMAIL: dataChanged.data });
    });

    test('should 200 and update user', async () => { 
      const response = await request.put(`${url}/6`)
        .set('Authorization', authHeader)
        .send({
          email: 'newTest@test.com',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(1);

      dataChanged.ids.push(6);
    });

    testAuthHeader(() => request.put(`${url}/6`));

    test('should 403 when unauthorized user is updating', async () => { 
      const response = await request.put(`${url}/3`)
        .set('Authorization', authHeader)
        .send({ email: 'newEmail@user.com' });

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
      expect(response.body.message).toBe(
        'Je bent niet bevoegd om deze gebruiker zijn info te zien',
      );
    });

    test('should 400 when missing email', async () => {
      const response = await request.put(`${url}/6`)
        .set('Authorization', authHeader)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.body).toHaveProperty('email');
    });
  });

});