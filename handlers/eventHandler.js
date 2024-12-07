const fs = require('fs');
const path = require('path');
const { sequelize } = require('../handlers/database');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  let eventCount = 0;

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client, sequelize));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client, sequelize));
    }
    eventCount++;
  }

  console.log(`Loaded ${eventCount} event(s).`);
}

module.exports = { loadEvents };
