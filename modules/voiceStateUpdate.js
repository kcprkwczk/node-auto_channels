module.exports = async function(oldState, newState, operations, client) {
    if (newState.channelId) {
        const operation = operations.find(op => op.joinToCreateNewRoomId === newState.channelId);

        if (operation) {
            const username = newState.member.user.username;
            const newChannel = await newState.guild.channels.create({
                name: `${operation.channelName} - ${username}`,
                type: 2,
                parent: operation.createRoomsParent,
                userLimit: operation.maxOnline,
                permissionOverwrites: []
            });
            newState.setChannel(newChannel);
        }
    }

    if (oldState.channelId) {
        const operation = operations.find(op => op.joinToCreateNewRoomId === oldState.channelId);

        if (!operation) {
            const channel = client.channels.resolve(oldState.channelId);
            if (channel && channel.members.size === 0) {
                const isCorrectParent = channel.parent && operations.some(op => op.createRoomsParent === channel.parent.id);
                if (isCorrectParent) {
                    channel.delete();
                }
            }
        }
    }
};