const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const config = require('config');

const REFRESH_TOKEN = config.get('email.auth.refreshToken');
const CLIENT_ID = config.get('email.auth.clientId');
const CLIENT_SECRET = config.get('email.auth.clientSecret');
const USER = config.get('email.auth.user');

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'https://developers.google.com/oauthplayground',
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

let accessToken = null;

async function refreshAndFetchAccessToken() {
  try {
    const newAccessToken = await oauth2Client.refreshAccessToken();
    accessToken = newAccessToken.credentials.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

const createTransporter = async () => {
  await refreshAndFetchAccessToken();
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
};


module.exports = createTransporter();
