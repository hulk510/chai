import Discord, { Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

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
  console.log(message);
  if (message.author.bot) return;
  if (message.channelId !== '889435057331241000') {
    return;
  }

  // message.channel.isThread();

  const thread = await message.startThread({
    name: message.content,
    autoArchiveDuration: 60,
    reason: 'Needed a separate thread for food',
  });
  console.log(`Created thread: ${thread.name}`);
  console.log(`Thread ID: ${thread.id}`);
  // const response = await getMessage(message.content);
  // if (!response) {
  //   message.channel.send('返信を返せません');
  //   return;
  // }
  // message.channel.send(response);
});

// client.on(Events.)
