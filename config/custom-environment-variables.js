module.exports = {
  env: 'NODE_ENV',
  cors: {  
    origins: 'CORS_ORIGIN',
  },
  database: {
    host: 'MYSQL_HOST',
    port: 'MYSQL_PORT',
    name: 'MYSQL_DB_NAME',
    username: 'MYSQL_USERNAME',
    password: 'MYSQL_PASSWORD',
  },
  email: {
    auth: {
      user: 'USER',
      pass: 'PASS',
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      refreshToken: 'REFRESH_TOKEN',
    },
    senderEmail: 'SENDER_EMAIL',
    frontendUrl: 'FURL',
  },
};