const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'shared',
    description: 'Find shared artists or tracks between you and others in the server.',
    usage: '[artists|tracks]',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message, args) => {
        const apiKey = process.env.LASTFM_API_KEY;

        // Determine the comparison type (artists by default)
        const type = args[0]?.toLowerCase();
        if (type !== 'artists' && type !== 'tracks') {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(
                    `Invalid argument. Use \`${message.client.prefix}shared artists\` or \`${message.client.prefix}shared tracks\`.`
                );
            return await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }

        try {
            // Fetch the user's Last.fm username from the database
            const requestingUser = await LastFm.findOne({ where: { userId: message.author.id } });

            if (!requestingUser) {
                const noUserEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        `You haven't set your Last.fm account yet. Use the \`${message.client.prefix}setlastfm\` command to link your account.`
                    );
                return await message.reply({ embeds: [noUserEmbed], allowedMentions: { repliedUser: false } });
            }

            const requestingUsername = requestingUser.lastfmUsername;

            // Fetch all server members who have linked their Last.fm accounts
            const linkedUsers = await LastFm.findAll();

            if (!linkedUsers || linkedUsers.length <= 1) {
                const noOthersEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        "Not enough users in this server have linked their Last.fm accounts. Use the `!setlastfm` command to get started!"
                    );
                return await message.reply({ embeds: [noOthersEmbed], allowedMentions: { repliedUser: false } });
            }

            // Fetch the requesting user's top items
            const requestingUserResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: type === 'artists' ? 'user.gettopartists' : 'user.gettoptracks',
                    user: requestingUsername,
                    api_key: apiKey,
                    format: 'json',
                    limit: 50,
                },
            });

            const requestingTopItems = requestingUserResponse.data[
                type === 'artists' ? 'topartists' : 'toptracks'
            ][type === 'artists' ? 'artist' : 'track'].map((item) => item.name);

            const sharedItems = new Map();

            // Loop through other users to find shared items
            for (const user of linkedUsers) {
                if (user.userId === message.author.id) continue; // Skip the requesting user

                const userResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                    params: {
                        method: type === 'artists' ? 'user.gettopartists' : 'user.gettoptracks',
                        user: user.lastfmUsername,
                        api_key: apiKey,
                        format: 'json',
                        limit: 50,
                    },
                });

                const otherUserTopItems = userResponse.data[
                    type === 'artists' ? 'topartists' : 'toptracks'
                ][type === 'artists' ? 'artist' : 'track'].map((item) => item.name);

                // Find common items
                requestingTopItems.forEach((item) => {
                    if (otherUserTopItems.includes(item)) {
                        sharedItems.set(
                            item,
                            sharedItems.get(item)
                                ? [...sharedItems.get(item), user.lastfmUsername]
                                : [user.lastfmUsername]
                        );
                    }
                });
            }

            if (sharedItems.size === 0) {
                const noSharedEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(`You don't have any shared ${type} with others in the server.`);
                return await message.reply({ embeds: [noSharedEmbed], allowedMentions: { repliedUser: false } });
            }

            // Format shared items for the embed
            const sharedItemsList = Array.from(sharedItems.entries())
                .map(([item, usernames]) => `**${item}**: ${usernames.join(', ')}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setTitle(`Shared ${type === 'artists' ? 'Artists' : 'Tracks'}`)
                .setDescription(sharedItemsList)
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching shared items:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`Failed to fetch shared ${type}. Please try again later.`);
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
