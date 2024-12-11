const crypto = require('crypto');
const axios = require('axios');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const LastFm = require('../../../models/LastFm');
require('dotenv').config();

module.exports = {
    name: 'setlastfm',
    description: 'Set and verify your Last.fm username with the bot.',
    requiredPermissions: [PermissionsBitField.Flags.EmbedLinks],
    userPermissions: [],
    owner: false,
    execute: async (message) => {
        const apiKey = process.env.LASTFM_API_KEY;
        const apiSecret = process.env.LASTFM_API_SECRET;

        try {
            // Check if the user already has a Last.fm username set
            const existingUser = await LastFm.findOne({ where: { userId: message.author.id } });

            if (existingUser) {
                const alreadySetEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription(`You have already set your Last.fm account to **${existingUser.lastfmUsername}**. If you need to update it, please contact support or use an appropriate command.`);
                return await message.reply({ embeds: [alreadySetEmbed], allowedMentions: { repliedUser: false } });
            }
            // Step 1: Generate a token for authentication
            const tokenResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'auth.getToken',
                    api_key: apiKey,
                    format: 'json',
                },
            });

            const token = tokenResponse.data.token;

            // Step 2: Send the authorization URL to the user
            const authUrl = `https://www.last.fm/api/auth/?api_key=${apiKey}&token=${token}`;
            const embed = new EmbedBuilder()
                .setColor(message.client.noColor)
                .setTitle('Verify your Last.fm account')
                .setDescription(`**Step 1:** [Click here to authorize your Last.fm account](${authUrl}).\n\n**Step 2:** After authorizing, type \`confirm\` in this chat to complete the setup.`)
                .setFooter({ text: 'You have 2 minutes to complete this process.' });
            
            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

            // Step 3: Wait for user to confirm
            const filter = (response) => response.author.id === message.author.id && response.content.toLowerCase() === 'confirm';
            const collector = message.channel.createMessageCollector({ filter, time: 120000 }); // 2-minute timeout

            collector.on('collect', async (response) => {
                collector.stop(); // Stop the collector as we have the confirmation.

                try {
                    const paramsString = `api_key${apiKey}methodauth.getSessiontoken${token}${apiSecret}`;
                    const apiSig = crypto.createHash('md5').update(paramsString).digest('hex');

                    // Step 4: Verify the token and get the Last.fm username
                    const sessionResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                        params: {
                            method: 'auth.getSession',
                            api_key: apiKey,
                            token: token,
                            api_sig: apiSig,
                            format: 'json',
                        },
                    });

                    if (sessionResponse.data.error) {
                        throw new Error('Failed to verify Last.fm username. Please try again.');
                    }

                    const lastfmUsername = sessionResponse.data.session.name;

                    // Step 5: Save the verified username in the database
                    const [user, created] = await LastFm.findOrCreate({
                        where: { userId: message.author.id },
                        defaults: { lastfmUsername },
                    });

                    if (!created) {
                        user.lastfmUsername = lastfmUsername;
                        await user.save();
                    }

                    const successEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`Your Last.fm username has been successfully verified and set to **${lastfmUsername}**.`);
                    return await message.reply({ embeds: [successEmbed], allowedMentions: { repliedUser: false } });
                } catch (error) {
                    console.error('Error verifying Last.fm token:', error.message);

                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('Failed to verify your Last.fm username. Please try again later.');
                    return await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
                }
            });

            // Step 6: Handle timeout
            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('The verification process has timed out. Please try again by running the command again.');
                    message.channel.send({ embeds: [timeoutEmbed] });
                }
            });
        } catch (error) {
            console.error('Error initiating Last.fm verification:', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('Failed to initiate the verification process. Please try again later.');
            return await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
        }
    },
};
