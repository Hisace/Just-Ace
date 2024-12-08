const GuildSettings = require('../models/GuildSettings');
const UserSettings = require('../models/UserSettings');
const { checkPermissions } = require('../handlers/permissionHandler');
require('dotenv').config();
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Ignore messages from bots
        if (message.author.bot) return;

        try {

            // Retrieve guild prefix from the database or register with default prefix
            const [guildSettings, created] = await GuildSettings.findOrCreate({
                where: { guildId: message.guild.id },
                defaults: { prefix: process.env.PREFIX },
            });

            // Extract prefix from guildSettings
            const serverPrefix = guildSettings.prefix;
            
            // Check if the bot is mentioned in the message
            if (message.mentions.has(client.user)) {
                const mentionReply = new EmbedBuilder()
                    .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setDescription(`Sup ${message.author.tag}!\nMy prefix here: \`${serverPrefix}\`\n\n Use \`${serverPrefix}help\` to get my command's list.`)
                    .setColor(client.noColorEmbed)
                    .setFooter({ text: "IDK what to put here!", iconURL: client.user.displayAvatarURL() });
                
                const inviteMe = new ButtonBuilder()
                    .setLabel('Invite Me')
                    .setURL('https://discordapp.com/oauth2/authorize?client_id=1314896219977416705')
                    .setStyle(ButtonStyle.Link);
                
                const support = new ButtonBuilder()
                    .setLabel('Support')
                    .setURL('https://discord.gg/W7zen4gGbv')
                    .setStyle(ButtonStyle.Link);
                
                const row = new ActionRowBuilder()
                    .addComponents(inviteMe, support);
                await message.reply({ embeds: [mentionReply], components: [row], allowedMentions: { repliedUser: false} });
            }
        
            // Check if the message starts with the prefix
            if (!message.content.startsWith(serverPrefix)) return;

            // Extract command and arguments from the message
            const args = message.content.slice(serverPrefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Get the command file corresponding to the command name
            const command = client.prefixedCommands.get(commandName) 
                || Array.from(client.prefixedCommands.values()).find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            // If the command doesn't exist, exit
            if (!command) return;

            // If the command is an owner command
            if (command.owner && message.author.id !== process.env.OWNER_ID) return;

            // Check if the user is blocked
            const userSettings = await UserSettings.findOne({ where: { userId: message.author.id } });
            if (userSettings && userSettings.blocked) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Blocked User')
                    .setDescription('You are blocked from using this bot.');

                return message.reply({ embeds: [embed], ephemeral: true });
            }

            if (!checkPermissions(message, command.requiredPermissions, true)) return; // Bot permissions
            if (!checkPermissions(message, command.userPermissions, false)) return; // User permissions

            // Execute the command
            await command.execute(message, args);

        } catch (error) {
            console.error('Error executing command:', error);
            message.reply({ content: 'There was an error executing that command.', ephemeral: true });
        }
    },
};