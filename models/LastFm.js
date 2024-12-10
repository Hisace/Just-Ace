
const { DataTypes } = require('sequelize');
const { sequelize } = require('../handlers/database');

const LastFm = sequelize.define('LastFm', {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    lastfmUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    timestamps: false,
  });
  
  module.exports = LastFm;
