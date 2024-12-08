const { DataTypes } = require('sequelize');
const { sequelize } = require('../handlers/database');

const GuildSettings = sequelize.define('GuildSettings', {
  guildId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  prefix: {
    type: DataTypes.STRING,
    defaultValue: '!', // Default prefix if not specified
    allowNull: false,
  },  
}, {
  timestamps: false,
});

module.exports = GuildSettings;