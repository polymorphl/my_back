var Sequelize = require('sequelize');
const crypto = require('crypto');

const web = require('../../connection').web;
const mapModel = require('../helpers').mapModel;
const generateQuery = require('../helpers').generateQuery;
const secret = require('../../../config/secret').secret;

let UserModel = web.define('user',{
  id: {type: Sequelize.INTEGER(11), unique: true, autoIncrement: true, primaryKey: true },
  email: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  firstname: { type: Sequelize.STRING },
  lastname: { type: Sequelize.STRING },
  created_at: {type:Sequelize.DATE}
},{
  schema: process.env.MYSQL_DATABASE,
  tableName: 'user',
  timestamps: false,
  scopes: {
    byId: function(id) {
      return { where: { id: id } };
    },
    byEmail: function(email) {
      return {
        attributes: userSets.authentification,
        where: { email: email }
      };
    }
  } // end scopes
});

let UserRoutines = {
  validatePassword: function(password, userPassword) {
    const dc = crypto.createDecipheriv('aes-128-ecb', UserRoutines.convertSecret(secret), '');
    const decrypted = dc.update(password, 'hex', 'utf8') + dc.final('utf8');
    return userPassword === decrypted;
  },
  convertSecret: function(hash) {
    const newKey = new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const bufStrKey = new Buffer(hash);
    for (let i = 0; i < bufStrKey.length; i++) {
      newKey[i % 16] ^= bufStrKey[i];
    }
    return newKey;
  },
  cryptPassword: function(password) {
    var c = crypto.createCipheriv("aes-128-ecb", UserRoutines.convertSecret(secret), "");
    var crypted = c.update(password, 'utf8', 'hex') + c.final('hex');
    return crypted;
  },
  changePassword: async function(id, password) {
    let userFromDB = await UserRoutines.getById(id, {
      dataSets: userSets.authentification
    });
    if (userFromDB) {
      return userFromDB.update({password: UserRoutines.cryptPassword(password)})
    }
    return false;
  },
  login: async function(email, password) {
    let userFromDB = await UserRoutines.getByEmail(email, {
      dataSets: userSets.authentification
    });
    if (userFromDB != null) {
      userFromDB = userFromDB.toJSON();
      if (UserRoutines.validatePassword(userFromDB.password.toString(), password)) {
        return userFromDB;
      }
      return false;
    } else {
      return false;
    }
  },
  createUser: async function(email, password, firstname, lastname){
    return UserModel.create({
      email: email,
      password: UserRoutines.cryptPassword(password),
      firstname: firstname,
      lastname: lastname,
      created_at: Sequelize.fn('NOW')
    });
  },
  getById: async function(id, query, options) {
 return UserModel.findOne({ where: { id: id }, attributes: userSets.authentification});
  },
  getByEmail: async function(email, query, options) {
    return UserModel.findOne({ where: { email: email }, attributes: userSets.authentification});
    //return UserModel.scope({method: ['byEmail', email]}).findOne(generateQuery(query, UserModel))
  }
};

const userSets =  {
  excerpt: ['id', 'email', 'firstname', 'lastname', 'created_at'],
  authentification: ['id', 'email', 'password']
};

// Map all routines in the Model
let User = mapModel(UserModel, UserRoutines, userSets);

// Export the mapped model
module.exports = { User: User }

