import Discord, { GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { getMessage } from './openai';

dotenv.config();

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.login(process.env.DISCORD_BOT_TOKEN);
client.on('ready', () => {
  console.log('Ready...');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== '889435057331241000') {
    return;
  }
  const response = await getMessage(message.content);
  if (!response) {
    message.channel.send('返信を返せません');
    return;
  }
  message.channel.send(response);
});
