const fs = require('fs');
const { Permissions } = require('discord.js');

function reloadConfig() {
    delete require.cache[require.resolve('../config.json')];
    return require('../config.json');
}

module.exports = {
    updateConfig: (message) => {
        if (message.content.startsWith('!setConfig ')) {
           if(!message.member.permissions.has('Administrator')) {
                   message.reply('You do not have permission to use this command.');
                   return;
           }
            const newConfig = message.content.slice('!setConfig '.length);
            if (newConfig.length === 0) {
                message.reply('No new config provided. Please provide a new config in the format `!setConfig {newConfig}`');
                return;
            }
            try {
                const parsedConfig = JSON.parse(newConfig);
                const isValid = Array.isArray(parsedConfig) && parsedConfig.every(item => {
                    return item.hasOwnProperty('joinToCreateNewRoomId') &&
                        item.hasOwnProperty('createRoomsParent') &&
                        item.hasOwnProperty('channelName') &&
                        item.hasOwnProperty('maxOnline');
                });
                if (!isValid) {
                    message.reply('Invalid config. Please make sure the config has the right structure.');
                    return;
                }
                fs.writeFileSync('config.json', JSON.stringify(parsedConfig, null, 2));
                operations = reloadConfig();  // reload the config
                message.reply('Config updated successfully!');
            } catch (error) {
                console.error('Failed to update config:', error);
                message.reply('Failed to update config. Please make sure the config is valid JSON.');
            }
        }
    }
};
