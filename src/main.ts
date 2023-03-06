import console from 'console';
import Discord, { Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { BufferWindowMemory } from 'langchain/memory';
import { initCommands } from './command.js';
import { getAgentMessage, memories } from './openai.js';
import { isGPTThread, writeThreadLog } from './thread.js';

dotenv.config();

initCommands();

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
  const channelId = message.channel.id;
  if (!isGPTThread(channelId)) {
    return;
  }
  // メモリ（memories）にスレッドのIDがなければ作成、あればそれを使う
  const memory = memories[channelId];
  if (!memory) {
    memories[channelId] = new BufferWindowMemory();
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
    // const response = await getLCMessage(message.content, memory);
    const response = await getAgentMessage(message.content);
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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  switch (commandName) {
    case 'ping':
      await interaction.reply('Pong!');
      break;
    case 'talk':
      if (interaction.channel?.isThread()) {
        interaction.reply({
          content: 'ここでは使えません',
          ephemeral: true,
        });
      }
      interaction
        .reply({
          content: 'スレッド名を入力してください',
          fetchReply: true,
          ephemeral: true,
        })
        .then(() => {
          const filter = (message: Discord.Message) => {
            return message.author.id === interaction.user.id;
          };
          interaction.channel
            ?.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
            .then(async (collected) => {
              const message = collected.first();
              if (!message) {
                return;
              }
              let thread: Discord.AnyThreadChannel | null = null;
              try {
                thread = await threadCreate(message);
              } catch (error) {
                console.error(error);
                thread?.delete();
                interaction.followUp({
                  content: 'スレッドを作成できませんでした',
                  ephemeral: true,
                });
              }
            })
            .catch((collected) => {
              interaction.followUp({
                content: '時間切れです。もう一度やり直してください',
                ephemeral: true,
              });
            });
        });
      break;
    default:
      break;
  }
});

const threadCreate = async (message: Discord.Message) => {
  const thread = await message.startThread({
    name: message.content,
    autoArchiveDuration: 60,
  });
  writeThreadLog(thread.id, message.author.id);
  thread.send({
    content: `${message.author}`,
  });
  return thread;
};
