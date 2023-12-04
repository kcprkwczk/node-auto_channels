const fs = require('fs');
const path = require('path');
const { Permissions } = require('discord.js');
const configPath = path.join(__dirname, '../config.json');

function reloadConfig() {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
}

function ensureServerConfigExists(config, serverId) {
    const serverConfig = config.find(c => c.serverId === serverId);
    if (!serverConfig) {
        const defaultChannelConfig = {
            joinToCreateNewRoomId: "",
            createRoomsParent: "",
            channelName: "New Room",
            maxOnline: 5
        };
        const newServerConfig = {
            serverId: serverId,
            channels: [defaultChannelConfig]
        };
        config.push(newServerConfig);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
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
                    return item.hasOwnProperty('serverId') && Array.isArray(item.channels) && item.channels.every(channel => {
                        return channel.hasOwnProperty('joinToCreateNewRoomId') &&
                            channel.hasOwnProperty('createRoomsParent') &&
                            channel.hasOwnProperty('channelName') &&
                            channel.hasOwnProperty('maxOnline');
                    });
                });
                if (!isValid) {
                    message.reply('Invalid config. Please make sure the config has the right structure.');
                    return;
                }
                fs.writeFileSync(configPath, JSON.stringify(parsedConfig, null, 2));
                message.reply('Config updated successfully!');
            } catch (error) {
                console.error('Failed to update config:', error);
                message.reply('Failed to update config. Please make sure the config is valid JSON.');
            }
        }
    },
    ensureServerConfig: (client) => {
        const config = reloadConfig();
        client.guilds.cache.forEach(guild => {
            ensureServerConfigExists(config, guild.id);
        });
    }
};
