const { DataTypes } = require('sequelize');
const { sequelize } = require('../handlers/database');

// ServerPets Model
const ServerPets = sequelize.define('ServerPets', {
    serverId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Each server has one pet
    },
    petName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    petType: {
        type: DataTypes.STRING, // Example: 'dog', 'cat', etc.
        allowNull: false,
    },
    }, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// PetStats Model
const PetStats = sequelize.define('PetStats', {
    petId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: ServerPets,
        key: 'id',
        },
    },
    happiness: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50, // Starting happiness
    },
    hunger: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50, // Starting hunger
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Starting level
    },
    experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Starting experience points
    },
    }, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Relationships
ServerPets.hasOne(PetStats, { foreignKey: 'petId', onDelete: 'CASCADE' });
PetStats.belongsTo(ServerPets, { foreignKey: 'petId' });

module.exports = { ServerPets, PetStats };