import console from 'console';
import Discord, { Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { initCommands } from './command.js';
import { getLCMessage } from './openai.js';

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
  // ここでチャンネルIDを動的に取得したい
  // ここで返信するチャンネルをthread_logから取得して含まれてたら返信するようにする
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
    const response = await getLCMessage(message.content);
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
    case 'server':
      break;
    case 'user':
      const message = await interaction.reply({
        content: 'You can react with Unicode emojis!',
        fetchReply: true,
      });
      message.react('😄');
      break;
    case 'talk':
      if (!interaction.channel?.isThread()) {
        const filter = (message: Discord.Message) => {
          return message.author.id === interaction.user.id;
        };
        interaction
          .reply({
            content: 'スレッド名を入力してください',
            fetchReply: true,
            ephemeral: true,
          })
          .then(() => {
            interaction.channel
              ?.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
              .then((collected) => {
                const message = collected.first();
                if (message) {
                  message
                    .startThread({
                      name: message.content,
                      autoArchiveDuration: 60,
                    })
                    .then((thread) => {
                      thread.send({
                        content: `${message.author}`,
                      });
                    })
                    .catch((error) => {
                      console.error(error);
                      interaction.followUp({
                        content: 'スレッドを作成できませんでした',
                        ephemeral: true,
                      });
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
      } else {
        interaction.reply({
          content: 'ここでは使えません',
          ephemeral: true,
        });
      }
      break;
    default:
      break;
  }
});
