const { withServer } = require('../supertest.setup');

describe('Health', () => { 
  
  let request;

  withServer(({
    supertest,
  }) => {
    request= supertest;
  });

  const url = '/api/health';

  describe('GET /api/health/ping', () => { 
    test('should 200 and return pong', async () => {
      const response = await request.get(`${url}/ping`);

      expect(response.statusCode).toBe(200);
      expect(response.body.pong).toBe(true);
    });
  });
  describe('GET /api/health/version', () => {
    test('should 200 and return version', async () => {
      const response = await request.get(`${url}/version`);

      expect(response.statusCode).toBe(200);
      expect(response.body.env).toBe('test');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.name).toBe('backend-portaal');
    });
  });
});