const http = require('http');

const socketIO = require('socket.io');

const { getLogger } = require('./logging');


let io;

const initSocket = (app) => {
  const server = http.createServer(app.callback());
  io = socketIO(server, {
    cors: {
      origin: 'http://localhost:5173',
    },
  });
  
  io.on('connection', (socket) => {

    socket.on('join', (userId) =>  {
      socket.join(userId);
    }); // works

    socket.on('verwerkBetaling', (data) => {
      socket.to(Number(data.userId)).emit('betalingVerwerken', 'done');
    });
    socket.on('succesBetaling', (data) => {

      socket.to(Number(data.userId)).emit('betalingSucces', 'done');
    });

    getLogger().info('socket connected');
  });


  

  return server;
};

const getSocket = () => {
  return io;
};

module.exports = {initSocket, getSocket};