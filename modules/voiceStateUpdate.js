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

    if (oldState.channelId && (!newState.channelId || newState.channelId !== oldState.channelId)) {
        const channel = client.channels.cache.get(oldState.channelId);
        if (channel && channel.members.size === 0) {
            const isCorrectParent = channel.parent && operations.some(op => op.createRoomsParent === channel.parentID);
            const isManagedChannel = operations.some(op => op.joinToCreateNewRoomId !== oldState.channelId);
            if (isCorrectParent && isManagedChannel) {
                channel.delete().catch(console.error);
            }
        }
    }
};
