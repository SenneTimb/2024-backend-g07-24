module.exports = {
  log: {
    level: 'info',
    disabled: false,
  },
  cors: {
    maxAge: 3 * 60 * 60,
  },
  database: {
    client: 'mysql2',
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