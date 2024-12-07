const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadSlashCommands(client) {
  client.slashCommands = new Collection();
  client.slashCategories = new Collection();

  const commandsPath = path.join(__dirname, '../commands/slash');
  const commandFolders = fs.readdirSync(commandsPath);
  let commandCount = 0;

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        client.slashCommands.set(command.data.name, command);
        commandCount++;

        if (!client.slashCategories.has(folder)) {
          client.slashCategories.set(folder, []);
        }
        client.slashCategories.get(folder).push(command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  console.log(`Loaded ${commandCount} slash command(s).`);
}

function loadPrefixCommands(client) {
  client.prefixedCommands = new Collection();
  client.prefixedCategories = new Collection();
  let commandCount = 0;

  const commandDirs = fs.readdirSync(path.join(__dirname, '../commands/prefix'), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const dir of commandDirs) {
    const folderPath = path.join(__dirname, '../commands/prefixed', dir);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if ('name' in command && 'execute' in command) {
        client.prefixedCommands.set(command.name, command);
        commandCount++;

        if (!client.prefixedCategories.has(dir)) {
          client.prefixedCategories.set(dir, []);
        }
        client.prefixedCategories.get(dir).push(command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
      }
    }
  }

  console.log(`Loaded ${commandCount} prefixed commands.`);
}

module.exports = { loadSlashCommands, loadPrefixCommands };