const logger = require('../../helpers/logger')

let events = (socket)=>{
  socket.on('message', (data)=>{
    logger.info('message!', {
      data: data
    });
  });
};

module.exports = {
  Chat: events
}
