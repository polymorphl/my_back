const model = require('../../model');
const generateQuery = require('../../model/helpers').generateQuery;

const User = model.User;

async function updateGeneralData(idArr){
  if (idArr != null || idArr[0] != undefined) {
    return new Promise(function(resolve){
      User.findAll(generateQuery({
        attributes: ['id', 'firstname', 'lastname'],
        where: { id: { $in: idArr } },
        include: [{
          association: User.settings, as: 'settings'
        }],
      }, User)).then(function(data){
        data = data.map(function(user){
          return user.toJSON();
        });
        resolve(data);
      });
    }).catch(err =>{
      console.log("err generalData", err);
      return err;
    });
  } else {
    console.log('no data to query in updateGeneralData (socket)');
  }
}

module.exports = {
  updateGeneralData: updateGeneralData
}
