const room = require('./rooms/user');

const updateGeneralData = room.updateGeneralData;
const FAST_UPDATE = 500;
const REGULAR_UPDATE = 1000;
const SLOW_UPDATE = 3000;
const SERVER_TICKRATE = 1000 / 5;

let timestamp = process.hrtime();
let delta, deltaS;

// describe all rooms that will update data to users
// takes a tickrate, a update function, and stores its own timer
let serverRooms = {
  generalData: {
    tickrate: REGULAR_UPDATE,
    timer: 0,
    fn: updateGeneralData
  }
};

// get delta between two updates, to increase every room timer
const updateTimer = ()=>{
  delta = process.hrtime(timestamp);
  deltaS = delta[0] + delta[1] / Math.pow(10,9);
};

// main socket io stream function
let streamUpdate = (io)=>{
  let idToSocket = {};
  let updt = async()=>{
    updateTimer();
    let userRooms = {};
    // store every user ID in each available room, to prepare updates
    for(let id in io.sockets.sockets){
      let socket = io.sockets.sockets[id];
      if(socket.u){
        idToSocket[socket.u.id] = id;
        for(let tag in socket.rooms){
          if(tag in serverRooms){
            if(!userRooms[tag]) { userRooms[tag]= []}
            userRooms[tag].push(socket.u.id);
          }
        }
      }
    }
    // fetch data for each room, for each found user
    for(let tag in serverRooms){
      let room = serverRooms[tag];
      room.timer += deltaS * 1000;
      if(room.timer >= room.tickrate && userRooms[tag]){
        room.timer = 0;
        if(userRooms[tag].length > 0){
          let userData = await room.fn(userRooms[tag]);
          //sendData
          sendUpdate(tag, userData, io.sockets.sockets, idToSocket);
        }
      }
    }
    timestamp = process.hrtime();
    setTimeout(updt, SERVER_TICKRATE);
  };
  updt();
};

let forceUpdate = async (socket, rooms)=>{
  let userRooms = {};
  rooms.forEach(function(room){
    if(room in serverRooms){
      if(!userRooms[room]) { userRooms[room]= []}
      userRooms[room].push(socket.u.id);
    }
  });
  for(let tag in serverRooms){
    let room = serverRooms[tag];
    if(userRooms[tag] && userRooms[tag].length > 0){
      let userData = await room.fn(userRooms[tag]);
      socket.emit(`${tag}:update`, userData[0]);
    }
  }
};

// parse found data and sends everything to according users
let sendUpdate = function(tag, data,sockets, idToSocket){
  let l = data.length;
  for(let i = 0; i < l; i++){
    let userData = data[i];
    let id = userData.id;
    delete userData.id;
    if(sockets[idToSocket[id]]){
      sockets[idToSocket[id]].emit(`${tag}:update`, userData);
    }
    else {
      console.error('User disconnected during update');
    }
  }
};

module.exports = {
  streamUpdate: streamUpdate,
  forceUpdate: forceUpdate
}

