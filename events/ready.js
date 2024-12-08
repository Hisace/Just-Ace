require('dotenv').config();
const { ActivityType } = require("discord.js");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
      console.log(`Ready! Logged in as ${client.user.tag}`);
      
      const guild = client.guilds.cache.get(process.env.GUILD_ID);
      if (guild) {
        await guild.commands.set(client.slashCommands.map(cmd => cmd.data));
        console.log('Guild Commands registered');
      } else {
        console.log('Guild not found');
      }

      client.user.setPresence({ activities: [{ name: "Made by Ace." ,type: ActivityType.Listening }], status: 'idle' });
    },
  };
  