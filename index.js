require('dotenv').config();
const Discord = require('discord.js');
const operations = require('./config.json');
const { GatewayIntentBits } = require('discord.js');
const voiceStateUpdate = require('./modules/voiceStateUpdate');

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    voiceStateUpdate(oldState, newState, operations, client);
});


client.login(process.env.DISCORD_TOKEN);