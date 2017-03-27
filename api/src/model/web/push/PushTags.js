const web = require('../../connection').web;
const Sequelize = require('sequelize');
const mapModel = require('../helpers').mapModel;

//push_tags
let PushTagModel = web.define('push_tags', {
  id: {type: Sequelize.INTEGER.UNSIGNED, unique: true, primaryKey: true, autoIncrement: true},
  tag_name: {type: Sequelize.STRING},
  tag_type: {type: Sequelize.STRING}
},{
  schema: process.env.SQL_WEB_DATABSE,
  tableName: 'push_tags',
  timestamps: false,
  scopes: {
    byTag: function(tag){
      return {
        where: {tag: tag}
      }
    }
  }
});
let PushTagRoutines = {
  getByTag: function(tag, query){
    return PushTag.scope({method:['byTag', tag]}).findOne(generateQuery(query, PushTag));
  }
};
let PushTag = mapModel(PushTagModel, PushTagRoutines, {});


//push_tag_relations
let PushTagRelationsModel = web.define('push_tag_relations', {
  id: {type: Sequelize.INTEGER.UNSIGNED, unique: true, primaryKey: true, autoIncrement: true},
  tag_id: {type: Sequelize.INTEGER.UNSIGNED},
  user_id: {type: Sequelize.INTEGER.UNSIGNED}
},{
  schema: process.env.MYSQL_DATABASE,
  tableName: 'push_tag_relations',
  timestamps: false
});
let PushTagRelationsRoutines = {};
let PushTagRelations = mapModel(PushTagRelationsModel, PushTagRelationsRoutines);

module.exports = {
  PushTag: PushTag,
  PushTagRelations: PushTagRelations
}
