const { withServer, loginLeverancier } = require('../supertest.setup');
const { testAuthHeader } = require('../common/auth');

describe('Betalingsherinnering', () => { 
  
  let request, authHeaderLeverancier;

  withServer(({
    supertest,
  }) => {
    request= supertest;
  });

  beforeAll(async () => {
    authHeaderLeverancier = await loginLeverancier(request);
  });

  const url = '/api/betalingsherinneringen';

  describe('GET /api/betalingsherinneringenalth/:orderId', () => { 
    
    testAuthHeader(() => request.get(`${url}/1`));

    test('should 404 when not exisiting herinnering', async () => {
      const response = await request.get(`${url}/1`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('Betalingsherinnering met ID 1 niet gevonden');
    });

    test('should 400 when invalid id', async () => {
      const response = await request.get(`${url}/invalid`)
        .set('Authorization', authHeaderLeverancier);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('orderId');
    });
  });
});