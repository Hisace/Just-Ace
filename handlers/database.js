const { Sequelize } = require('sequelize');
const { dbConfig } = require('../config/config.json');

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    logging: false,
  });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const syncModels = async () => {
    try {
      await sequelize.sync();
      console.log('Database models synced!');
    } catch (error) {
      console.error('Error syncing database models:', error);
    }
  };
  
  module.exports = { sequelize, connectDB, syncModels };