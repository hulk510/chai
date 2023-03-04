import Discord, { Events, GatewayIntentBits } from 'discord.js';
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

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  // ここでチャンネルIDを動的に取得したい
  if (message.channelId !== '1081105541545328730') {
    return;
  }

  let dots = '🤔 .';
  let msg = message.channel.send(dots);
  let interval = setInterval(() => {
    dots += ' .';
    msg.then((m) => {
      m.edit(dots);
    });
  }, 1000);
  try {
    const response = await getMessage(message.content);
    message.channel.send(response);
  } catch (error) {
    console.error(error);
    message.channel.send('返信を返せません');
  } finally {
    clearInterval(interval);
    msg.then((m) => {
      m.delete();
    });
  }
});
