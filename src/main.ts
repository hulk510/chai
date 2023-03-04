import Discord, {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Events,
  GatewayIntentBits,
} from 'discord.js';
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
  // if (message.interaction?.commandName === 'ping') {
  //   message.startThread({
  //     name: message.content,
  //     autoArchiveDuration: 60,
  //     reason: 'Needed a separate thread for food',
  //   });
  // }
  // console.log(message);
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
  if (!interaction.isCommand()) return;
  // console.log(interaction); // channelidとかは取れる
  const { commandName } = interaction;

  switch (commandName) {
    case 'ping':
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('primary')
          .setLabel('Click me!')
          .setStyle(ButtonStyle.Primary)
      );
      await interaction.reply({
        content: 'I think you should,',
        components: [row],
      });
      await interaction.channel
        ?.awaitMessageComponent({ componentType: ComponentType.Button })
        .then((interaction) => {
          interaction.message.startThread({
            name: interaction.message.content,
            autoArchiveDuration: 60,
            reason: 'Needed a separate thread for food',
          });
          console.log(interaction);
        });
      break;
    case 'server':
      await interaction.reply('Server info.');
      break;
    case 'user':
      await interaction.reply('User info.');
      break;
    case 'new':
      break;
    default:
      break;
  }
});
