import Discord, { Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { getMessageStream } from './openai';

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
  if (message.channelId !== '1081105541545328730') {
    return;
  }

  // message.channel.isThread();

  // const thread = await message.startThread({
  //   name: message.content,
  //   autoArchiveDuration: 60,
  //   reason: 'Needed a separate thread for food',
  // });
  // console.log(`Created thread: ${thread.name}`);
  // console.log(`Thread ID: ${thread.id}`);
  const stream = (await getMessageStream(message.content)) as any as Readable;
  let msg:
    | Promise<Discord.Message<false>>
    | Promise<Discord.Message<true>>
    | null = null;
  let responseMessage = '';
  stream.on('data', (chunk) => {
    try {
      const chunkString = chunk.toString().trim();
      if (chunkString.startsWith('data: ') || chunkString.endsWith('\n')) {
        console.log(chunkString);
        const res = chunkString.replace('data: ', '');
        console.log('hey', res);
        const data = JSON.parse(res);
        const content = data.choices[0].delta?.content || '';
        if (content.trim() === '') {
          return;
        }
        if (!msg) {
          responseMessage = content;
          msg = message.channel.send(responseMessage);
        } else {
          responseMessage += content;
          msg.then((m) => {
            m.edit(responseMessage);
          });
        }
      }
    } catch (error) {
      console.error(error);
      message.channel.send('返信を返せません');
    }
  });
});
