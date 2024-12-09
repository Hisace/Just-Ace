
const { DataTypes } = require('sequelize');
const { sequelize } = require('../handlers/database');

const UserSettings = sequelize.define('UserSettings', {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    lastfmUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blocked: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
    }
  }, {
    timestamps: false,
  });
  
  module.exports = UserSettings;
