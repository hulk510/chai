import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!'),
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!'),
  new SlashCommandBuilder()
    .setName('talk')
    .setDescription('ChatGPTとスレッドで話す'),
].map((command) => command.toJSON());

export const initCommands = async () => {
  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN || ''
  );

  rest
    .put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_BOT_CLIENT_ID || '',
        process.env.DISCORD_GUILD_ID || ''
      ),
      { body: commands }
    )
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
};
