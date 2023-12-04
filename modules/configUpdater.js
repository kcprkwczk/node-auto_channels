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
        const newServerConfig = {
            serverId: serverId,
            channels: []
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
                message.reply('No new config provided. Please provide a new config in the format !setConfig {newConfig}');
                return;
            }
            try {
                const parsedChannels = JSON.parse(newConfig);
                // Ensure that the provided configuration is an array of channels
                if (!Array.isArray(parsedChannels)) {
                    message.reply('Invalid config. The provided config should be an array of channel configurations.');
                    return;
                }
                const serverId = message.guild.id;
                const config = reloadConfig();
                ensureServerConfigExists(config, serverId);
                const serverConfig = config.find(c => c.serverId === serverId);
                serverConfig.channels = parsedChannels;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
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
