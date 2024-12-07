const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const { loadEvents } = require('./handlers/eventHandler');
const { loadSlashCommands, loadPrefixCommands } = require('./handlers/commandHandler');
const { connectDB, syncModels } = require('./handlers/database');
const { checkRatelimt } = require('./handlers/rateLimit');
require('dotenv').config();

const client = new Client({ intents: [ Guilds, GuildMessages, MessageContent ]});

//(async () => {
//    await connectDB();
//    await syncModels();
//})();

loadEvents(client);
loadPrefixCommands(client);
loadSlashCommands(client);
checkRatelimt(process.env.DISCORD_TOKEN);

client.emoji = require('./assets/emojis.json');
client.color = require('./assets/colors.json');
client.noColor = '2B2D31',

client.login(process.env.DISCORD_TOKEN);