require('dotenv').config();
const Discord = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
const voiceStateUpdate = require('./modules/voiceStateUpdate');
const configUpdater = require('./modules/configUpdater');
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,

    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    voiceStateUpdate(oldState, newState, client);
});

client.on('messageCreate', message => {
    configUpdater.updateConfig(message);
});


client.login(process.env.DISCORD_TOKEN);