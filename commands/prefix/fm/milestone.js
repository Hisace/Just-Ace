const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'milestone',
    description: 'Show when you will reach your next play count milestone.',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message) => {
        const apiKey = process.env.LASTFM_API_KEY;

        try {
            // Fetch the user's Last.fm username
            const userRecord = await LastFm.findOne({ where: { userId: message.author.id } });

            if (!userRecord) {
                const noUserEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        `You haven't set your Last.fm account yet. Use the \`${message.client.prefix}setlastfm\` command to link your account.`
                    );
                return await message.reply({ embeds: [noUserEmbed], allowedMentions: { repliedUser: false } });
            }

            const username = userRecord.lastfmUsername;

            // Fetch total scrobbles
            const userInfoResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.getinfo',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const totalScrobbles = parseInt(userInfoResponse.data.user.playcount, 10);
            const userInfo = userInfoResponse.data.user;
            const avatar = userInfo.image?.find((img) => img.size === 'large')?.['#text'] || null;

            // Fetch recent tracks
            const recentTracksResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'user.getrecenttracks',
                    user: username,
                    api_key: apiKey,
                    format: 'json',
                    limit: 200, // Maximum allowed
                },
            });

            const recentTracks = recentTracksResponse.data.recenttracks.track;
            const recentTimestamps = recentTracks
                .filter((track) => track.date)
                .map((track) => parseInt(track.date.uts, 10));

            if (recentTimestamps.length === 0) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        "Not enough recent listening data to calculate your milestone. Start listening and try again later!"
                    );
                return await message.reply({ embeds: [noDataEmbed], allowedMentions: { repliedUser: false } });
            }

            // Calculate average daily scrobbles
            const earliestTimestamp = Math.min(...recentTimestamps);
            const latestTimestamp = Math.max(...recentTimestamps);
            const days = (latestTimestamp - earliestTimestamp) / (24 * 60 * 60);

            const averageDailyScrobbles = recentTimestamps.length / days;

            if (averageDailyScrobbles === 0) {
                const noActivityEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(
                        "It looks like you're not actively scrobbling. Start listening and try again later!"
                    );
                return await message.reply({ embeds: [noActivityEmbed], allowedMentions: { repliedUser: false } });
            }

            // Determine the next milestone
            const nextMilestone = Math.ceil(totalScrobbles / 1000) * 1000;
            const scrobblesRemaining = nextMilestone - totalScrobbles;
            const daysToMilestone = scrobblesRemaining / averageDailyScrobbles;

            const milestoneDate = new Date(Date.now() + daysToMilestone * 24 * 60 * 60 * 1000);

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setAuthor({ name: 'Next Play Count Milestone', iconURL: message.author.displayAvatarURL() })
                .setDescription(
                    `**Total Scrobbles:** ${totalScrobbles}\n` +
                    `**Next Milestone:** ${nextMilestone} scrobbles\n` +
                    `**Estimated Date:** ${milestoneDate.toDateString()}`
                )
                .setFooter({ text: `Keep listening, ${message.author.username}!` });

            if (avatar) embed.setThumbnail(avatar);

            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching milestone data:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to fetch milestone data. Please try again later.');
            await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
