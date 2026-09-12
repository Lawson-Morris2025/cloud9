const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  EmbedBuilder, 
  PermissionsBitField 
} = require('discord.js');
require('dotenv').config();
const express = require('express');

// --- 1. Express Web Server (Required for Render) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🛒 Amy Sosa & Cloud 9 Self-Roles Bot is online!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// --- 2. Discord Bot Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

const characterRoles = {
  'char_amy': 'Store Manager / Amy',
  'char_jonah': 'Floor Worker / Jonah',
  'char_dina': 'Security / Dina',
  'char_glenn': 'Assistant Manager / Glenn',
  'char_mateo': 'Cloud 9 Stylist / Mateo',
  'char_garrett': 'Photo Center / Garrett',
  'ping_rewatch': 'Re-watch Club',
  'ping_groupwatch': 'Group Watch Party',
  'ping_announcements': 'Store Announcements'
};

client.once('ready', async () => {
  console.log(`Amy Sosa is on the clock! Logged in as ${client.user.tag}`);

  const data = [
    {
      name: 'post-roles',
      description: 'Amy posts the Cloud 9 self-role character selection panel (Admin only)',
    }
  ];

  await client.application.commands.set(data);
});

// --- 3. Amy Welcomes New Shoppers ---
client.on('guildMemberAdd', async member => {
  try {
    const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'welcome');
    if (!welcomeChannel) return;

    const amyEmbed = new EmbedBuilder()
      .setTitle('🛒 Look who clocked in!')
      .setDescription(`Hey **${member}**! Welcome to Cloud 9. Grab a nametag and head over to the self-roles channel to pick your character shift before Dina notices you're standing around!`)
      .setColor(0x0055ff)
      .setThumbnail(member.user.displayAvatarURL());

    await welcomeChannel.send({ embeds: [amyEmbed] });
  } catch (err) {
    console.error('Failed to send welcome message:', err);
  }
});

// --- 4. Commands & Interactivity ---
client.on('interactionCreate', async interaction => {
  try {
    // Post Self-Roles Panel Command
    if (interaction.isChatInputCommand() && interaction.commandName === 'post-roles') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Nice try, corporate. You need Administrator permissions to post the shift roles panel.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🛒 Cloud 9 Employee Shift & Character Assignment')
        .setDescription('*(Amy sighs from behind the register)* "Look, pick your character identity and notification pings from the dropdown below so we know who we are dealing with on the floor."')
        .setColor(0x0055ff)
        .setFooter({ text: 'Powered by Amy Sosa & Cloud 9 Systems' });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('character_select')
        .setPlaceholder('Choose your Cloud 9 character or ping preferences...')
        .addOptions([
          { label: 'Amy Sosa (The Realist)', description: 'Exhausted manager energy', value: 'char_amy', emoji: '☕' },
          { label: 'Jonah Simms (The Activist)', description: 'Over-explaining retail logic', value: 'char_jonah', emoji: '📚' },
          { label: 'Dina Fox (Security Chief)', description: 'Bird enthusiast & rule enforcer', value: 'char_dina', emoji: '🦅' },
          { label: 'Glenn Sturgis (The Optimist)', description: 'Wholesome church vibes', value: 'char_glenn', emoji: '😇' },
          { label: 'Mateo Liwanag (The Ambitious)', description: 'Serving absolute looks', value: 'char_mateo', emoji: '💅' },
          { label: 'Garrett Keenan (The Sarcastic)', description: 'Announcement booth operator', value: 'char_garrett', emoji: '🎧' },
          { label: 'Re-watch Club Ping', description: 'Get notified for series re-watches', value: 'ping_rewatch', emoji: '🔄' },
          { label: 'Group Watch Party Ping', description: 'Get notified for live watch parties', value: 'ping_groupwatch', emoji: '🍿' },
          { label: 'Store Announcements Ping', description: 'General server updates', value: 'ping_announcements', emoji: '📢' }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: 'Amy successfully posted the character self-roles panel!', ephemeral: true });
    }

    // Handle Role Selections
    if (interaction.isStringSelectMenu() && interaction.customId === 'character_select') {
      await interaction.deferReply({ ephemeral: true });
      const selectedKey = interaction.values[0];
      const targetRoleName = characterRoles[selectedKey];

      let role = interaction.guild.roles.cache.find(r => r.name === targetRoleName);
      
      if (!role) {
        role = await interaction.guild.roles.create({
          name: targetRoleName,
          color: 'Random',
          reason: 'Cloud 9 Automated Role Setup'
        });
      }

      // If it's a character role, clear other character roles so they only hold one active persona
      if (selectedKey.startsWith('char_')) {
        for (const key of Object.keys(characterRoles)) {
          if (key.startsWith('char_')) {
            const rName = characterRoles[key];
            const existingRole = interaction.guild.roles.cache.find(r => r.name === rName);
            if (existingRole && interaction.member.roles.cache.has(existingRole.id)) {
              await interaction.member.roles.remove(existingRole);
            }
          }
        }
        await interaction.member.roles.add(role);
        return interaction.editReply({ content: `Shift assigned! You are now rocking the character role: **${targetRoleName}**.` });
      } else {
        // Toggle notification roles
        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.remove(role);
          return interaction.editReply({ content: `Opted out of **${targetRoleName}** notifications.` });
        } else {
          await interaction.member.roles.add(role);
          return interaction.editReply({ content: `You are now signed up for **${targetRoleName}** notifications!` });
        }
      }
    }

  } catch (error) {
    console.error('Interaction error:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
