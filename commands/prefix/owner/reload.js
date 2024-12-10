const fs = require('fs');
const path = require('path');
const { loadSlashCommands, loadPrefixCommands } = require('../../../handlers/commandHandler');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'reload',
    description: 'Reloads all command modules, including prefixed and slash commands.',
    aliases: ['rl'],
    requiredPermissions: [],
    userPermissions: [],
    owner: true,
    async execute(message, args) {
        // Define the paths to the command directories
        const prefixedCommandsDir = path.join(__dirname, '../../prefix');
        const slashCommandsDir = path.join(__dirname, '../../slash');

        // Reload all prefixed commands
        const prefixedCommandDirs = fs.readdirSync(prefixedCommandsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const dir of prefixedCommandDirs) {
            const folderPath = path.join(prefixedCommandsDir, dir);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                // Delete the cached version of the command
                delete require.cache[require.resolve(filePath)];
            }
        }

        // Reload all prefixed commands
        message.client.prefixedCommands.clear();
        message.client.prefixedCategories.clear();
        loadPrefixCommands(message.client);

        // Reload all slash commands
        const slashCommandFolders = fs.readdirSync(slashCommandsDir);

        for (const folder of slashCommandFolders) {
            const folderPath = path.join(slashCommandsDir, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                // Delete the cached version of the slash command
                delete require.cache[require.resolve(filePath)];
            }
        }

        // Reload all slash commands
        message.client.slashCommands.clear();
        message.client.slashCategories.clear();
        loadSlashCommands(message.client);

        const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: 'Reload of commands was successful.', iconURL: message.client.user.displayAvatarURL()})
        return message.reply({ embeds: [embed] });

    },
};
