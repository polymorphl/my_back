const forceUpdate = require('../update');

let events = (socket)=>{
  socket.on('room:join', (tags)=>{
    let len = tags.length;
    for(let i = 0; i< len; i ++){
      socket.join(tags[i]);
    }
    //once room is joined, send data stream immediately
    forceUpdate(socket, tags);
  });

  socket.on('room:leave', (tag)=>{
    socket.leave(tag);
  });
};


module.exports = {
  Rooms: events
}
