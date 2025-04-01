const { withServer } = require('../supertest.setup');

describe('Products', () => { 
  
  let request;

  withServer(({
    supertest,
  }) => {
    request= supertest;
  });

  const url = '/api/producten';

  describe('GET /api/producten', () => { 
    test('should 200 and return products', async () => {
      const response = await request.get(`${url}?pagina=1`);

      expect(response.statusCode).toBe(200);
      expect(response.body.products[0].id).toBe(1);
      expect(response.body.products[0].naam).toBe('Tablet');
      expect(response.body.products[0].aantal).toBe(20);
      expect(response.body.total).toBe(7);
    });

    test('should 400 when missing query', async () => { 
      const response = await request.get(`${url}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('pagina');
    });
  });
  describe('GET /api/producten/:id', () => {
    test('should 200 and return product', async () => {
      const response = await request.get(`${url}/1`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.naam).toBe('Tablet');
      expect(response.body.aantalInStock).toBe(20);
    });

    test('should 404 when not existing product', async () => {
      const response = await request.get(`${url}/99`);

      expect(response.statusCode).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
      expect(response.body.message).toBe('Product met ID 99 niet gevonden');
    });

    test('should 400 when invalid product id', async () => {
      const response = await request.get(`${url}/invalid`);

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
  });
});