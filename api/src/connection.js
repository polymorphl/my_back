let Sequelize = require('sequelize');

let web = new Sequelize(process.env.MYSQL_DATABASE,
                        process.env.MYSQL_USER,
                        process.env.MYSQL_PASSWORD, {
          host: process.env.MYSQL_HOST || '127.0.0.1',
          dialect: 'mysql',
          port: 3306
});

web.authenticate().then(function(state, a) {
  console.log(state, a)
})

web.dialect.supports.schemas = true;


module.exports = { web: web };
