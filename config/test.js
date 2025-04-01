module.exports = {
  log: {
    level: 'silly',
    disabled: true,
  },
  cors: {
    origins: ['http://localhost:5173', 'http://localhost:4173'],
    maxAge: 3 * 60 * 60,
  },
  database: {
    client: 'mysql2',
    host: 'vichogent.be',
    port: 40058,
    name: 'SDP2_2324_DB_G07',
  },
  auth: {
    jwt: {
      secret: 'eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked',
      expirationInterval: 60 * 60 * 1000, // ms (1 hour)
      issuer: 'groep07SDPII.hogent.be',
      audience: 'groep07SDPII.hogent.be',
    },
    argon: {
      saltLength: 16,
      hashLength: 32,
      timeCost: 6,
      memoryCost: 2 ** 17,
    },
  },
};