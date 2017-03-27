let gcm = require('node-gcm'); // URL: https://github.com/ToothlessGear/node-gcm

const sender = new gcm.Sender(process.env.FIREBASE_API_KEY);

let registrationTokens = [];

/*
** Send Method
*/
async function sendOneTime(msg, tokens) {
  //prepare message
  var message = new gcm.Message();
  message.addNotification({
    title: `From: ${process.env.DOMAIN}`,
    body: msg
  });

  //prepare tokens
  registrationTokens = tokens;

  // Send the message
  return new Promise(function(resolve, reject) {
    // ... trying only once
    sender.sendNoRetry(message, {
      registrationTokens: registrationTokens
    }, function (err, response) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(response);
      }
    });
  });

}


module.exports = { 
  sendOneTime 
};
