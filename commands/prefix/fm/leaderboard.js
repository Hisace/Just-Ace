const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'leaderboard',
    description: 'Displays a leaderboard for the server\'s most active listeners.',
    aliases: ['lb'],
    usage: '',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message) => {
        const apiKey = process.env.LASTFM_API_KEY;

        try {
            // Fetch all server members who have linked their Last.fm accounts
            const linkedUsers = await LastFm.findAll();

            if (!linkedUsers || linkedUsers.length === 0) {
                const noUsersEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        "No users have linked their Last.fm accounts in this server. Use the `!setlastfm` command to start!"
                    );
                return await message.reply({ embeds: [noUsersEmbed], allowedMentions: { repliedUser: false } });
            }

            const scrobbles = [];

            // Loop through users to fetch their total scrobbles
            for (const user of linkedUsers) {
                const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                    params: {
                        method: 'user.getinfo',
                        user: user.lastfmUsername,
                        api_key: apiKey,
                        format: 'json',
                    },
                });

                const playCount = response.data.user?.playcount || 0;

                scrobbles.push({
                    username: user.lastfmUsername,
                    discordId: user.userId,
                    playCount,
                });
            }

            // Sort by play count (most scrobbles first)
            scrobbles.sort((a, b) => b.playCount - a.playCount);

            // Create leaderboard embed
            const leaderboard = scrobbles
                .map((entry, index) => {
                    const discordUser = message.guild.members.cache.get(entry.discordId)?.user || 'Unknown User';
                    return `**${index + 1}.** ${discordUser} (${entry.username}) - ${entry.playCount} scrobbles`;
                })
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setTitle('Scrobbles Leaderboard')
                .setDescription(leaderboard)
                .setThumbnail(message.guild.iconURL())
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching leaderboard:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch the leaderboard. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
