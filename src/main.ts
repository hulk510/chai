import Discord, { GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

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

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== 'some channelid') {
    return;
  }
  message.channel.send('...');
  console.log(message.channelId);
  const response = (
    await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: message.content,
      temperature: 0,
      max_tokens: 300,
    })
  ).data.choices[0].text;
  if (!response) {
    message.channel.send('返信を返せません');
    return;
  }
  console.log(response);
  message.channel.send(response);
});
