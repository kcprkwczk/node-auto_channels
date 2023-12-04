const fs = require('fs');
const path = require('path');

async function loadConfig() {
    const configPath = path.join(__dirname, '../config.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configFile);
}

module.exports = async function(oldState, newState, client) {
    const config = await loadConfig();
    const serverConfig = config.find(c => c.serverId === newState.guild.id);

    if (!serverConfig) {
        console.error(`Nie znaleziono konfiguracji dla serwera z ID: ${newState.guild.id}`);
        return;
    }

    const operations = serverConfig.channels;

    if (newState.channelId) {
        const operation = operations.find(op => op.joinToCreateNewRoomId === newState.channelId);

        if (operation) {
            const username = newState.member.nickname || newState.member.user.username;
            const newChannel = await newState.guild.channels.create({
                name: `${operation.channelName} ${username}`,
                type: 2,
                parent: operation.createRoomsParent,
                userLimit: operation.maxOnline,
                permissionOverwrites: []
            });
            await newState.setChannel(newChannel);
        }
    }
    if (oldState.channelId && !newState.channelId) {
        const channel = oldState.guild.channels.cache.get(oldState.channelId);
        const isBotCreatedChannel = operations.some(op => op.createRoomsParent === channel.parentId);
        if (channel && isBotCreatedChannel && channel.members.size === 0) {
            try {
                await channel.delete();
                console.log(`Usunięto kanał: ${channel.name}`);
            } catch (error) {
                console.error(`Nie udało się usunąć kanału: ${error}`);
            }
        }
    }
};