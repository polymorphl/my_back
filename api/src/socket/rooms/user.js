const model = require('../../model');
const generateQuery = require('../../model/helpers');

const User = model.User;

async function updateResources(idArr){
  return new Promise(function(resolve){
    User.findAll(generateQuery({
      attributes: ['id'],
      where:{
        id: {
          $in: idArr
        }
      },
      dataSets: ['resources']
    }, User)).then(function(data){
      data = data.map(function(user){
        return user.toJSON();
      });
      resolve(data);
    });
  }).catch(err =>{
    Throw(err);
  });
}

async function updateExperience(idArr){
  return new Promise(function(resolve){
    User.findAll(generateQuery({
      attributes: ['id', 'nickname'],
      where: {
        id: {
          $in: idArr
        }
      },
      dataSets: ['experience']
    }, User)).then(function(data){
      data = data.map(function(user){
        return user.toJSON();
      });
      resolve(data);
    });
  }).catch(err =>{
    Throw(err);
  });
}

async function updateGeneralData(idArr){
  return new Promise(function(resolve){
    User.findAll(generateQuery({
      attributes: ['id', 'firstname', 'lastname'],
      where: { id: { $in: idArr } },
      include: [{
        association: User.settings, as: 'settings'
      },{
        association: User.devices
      }],
    }, User)).then(function(data){
      data = data.map(function(user){
        return user.toJSON();
      });
      resolve(data);
    });
  }).catch(err =>{
    Throw(err);
  });
}

module.exports = {
  updateResources: updateResources,
  updateExperience: updateExperience,
  updateGeneralData: updateGeneralData
}
