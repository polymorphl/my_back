const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const sticky = require('sticky-listen');

const Chat = require('./endpoints/chat').Chat;
const Rooms = require('./endpoints/room').Rooms;
const streamUpdate = require('./update').streamUpdate;
const removePrefixInAuthorization = require('../router/middlewares').removePrefixInAuthorization;
const C = require('../const').C;
const logger = require('../helpers/logger').logger;
const cert = require('../../config/secret').secret;

let io;

let socketApp = (server)=> {
  // init socket io
  try {
    io = require('socket.io')(server);
    if( io != null ) {
      logger.info( "Socket server ready!" );
    } else {
      throw new Error( "Returned null after attaching to koa server." );
    }
  } catch( error ) {
    console.error( "Failed to init socket.io!", error );
  }

  if(process.env.EXEC_MODE == 2){
    sticky.listen(server);
  }

  io.on('connection', (socket) => {
    var auth_timeout = setTimeout(function(){
      socket.disconnect('unauthorized');
    }, C.SOCKET_TIMEOUT);
    socket.on('authenticate', (data)=>{
      clearTimeout(auth_timeout);
      // error handler
      var onError = function(err, code) {
        if (err) {
          code = code || 'unknown';
          var error = new UnauthorizedError(code, {
            message: (Object.prototype.toString.call(err) === '[object Object]' && err.message) ? err.message : err
          });
          var callback_timeout;
          // If callback explicitely set to false, start timeout to disconnect socket
          if (options.callback === false || typeof options.callback === "number") {
            if (typeof options.callback === "number") {
              if (options.callback < 0) {
                // If callback is negative(invalid value), make it positive
                options.callback = Math.abs(options.callback);
              }
            }
            callback_timeout = setTimeout(function () {
              socket.disconnect('unauthorized');
            }, (options.callback === false ? 0 : options.callback));
          }
          socket.emit('unauthorized', error, function() {
            if (typeof options.callback === "number") {
              clearTimeout(callback_timeout);
            }
            socket.disconnect('unauthorized');
          });
          return; // stop logic, socket will be close on next tick
        }
      };

      if(!data || typeof data.tkn !== "string") {
        return onError({message: 'invalid token datatype'}, 'invalid_token');
      }

      jwt.verify(removePrefixInAuthorization(data.tkn), cert, function(err, decoded) {
        if (err) {
          logger.error('[SOCKET.IO]', err);
          socket.emit('unauthorized');
        } else {
          socket.u = decoded.user;
          socket.emit('authenticated');
          logger.info('[SOCKET.IO] - user decoded: %s', decoded.user.aid);
          defineConnectedEndpoints(socket);
        }
      });
    });
  });

  streamUpdate(io); //launch socket io stream
};

let defineConnectedEndpoints = (socket) => {
  Chat(socket);
  Rooms(socket);
  socket.emit('connected');
};

function UnauthorizedError (code, error) {
  new Error.call(this, error.message);
  this.message = error.message;
  this.inner = error;
  this.data = {
    message: this.message,
    code: code,
    type: "UnauthorizedError"
  };
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;

module.exports = {
  socketApp
}
