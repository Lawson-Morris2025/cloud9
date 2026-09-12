const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder, 
  ChannelType, 
  PermissionsBitField 
} = require('discord.js');
require('dotenv').config();
const express = require('express');

// --- 1. Express Web Server (Required for Render) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🛒 Cloud 9 Systems & Amy Sosa are online and running!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// --- 2. Discord Bot Setup (Safe Intents Only) ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const characterRoles = {
  'char_amy': 'Store Manager / Amy',
  'char_jonah': 'Floor Worker / Jonah',
  'char_dina': 'Security / Dina',
  'char_glenn': 'Assistant Manager / Glenn',
  'char_mateo': 'Cloud 9 Stylist / Mateo',
  'char_garrett': 'Photo Center / Garrett'
};

client.once('ready', async () => {
  console.log(`Cloud 9 Systems Online! Logged in as ${client.user.tag}`);

  const data = [
    {
      name: 'build-cloud9',
      description: 'Amy Sosa builds the entire Superstore server channels and panels (Admin only)',
    }
  ];

  await client.application.commands.set(data);
});

client.on('interactionCreate', async interaction => {
  try {
    // 1. Automated Server Building Command
    if (interaction.isChatInputCommand() && interaction.commandName === 'build-cloud9') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Nice try, corporate. You need Administrator permissions to let Amy build the store.', ephemeral: true });
      }

      await interaction.reply({ content: '☕ Amy Sosa is clocking in and setting up Cloud 9... Building channels now!', ephemeral: true });
      const guild = interaction.guild;

      // Create Categories & Channels
      const welcomeCategory = await guild.channels.create({ name: '📢 STORE DIRECTORY', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'rules-and-info', type: ChannelType.GuildText, parent: welcomeCategory.id });
      const setupChannel = await guild.channels.create({ name: 'employee-onboarding', type: ChannelType.GuildText, parent: welcomeCategory.id });

      const mainCategory = await guild.channels.create({ name: '☁️ CLOUD 9 FLOOR', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'break-room', type: ChannelType.GuildText, parent: mainCategory.id });
      await guild.channels.create({ name: 'cloud-9-memes', type: ChannelType.GuildText, parent: mainCategory.id });
      await guild.channels.create({ name: 'the-cold-open', type: ChannelType.GuildText, parent: mainCategory.id });

      const showCategory = await guild.channels.create({ name: '📺 THE SHOW', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'episode-discussion', type: ChannelType.GuildText, parent: showCategory.id });

      const voiceCategory = await guild.channels.create({ name: '🎧 BREAKROOM VOICE', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'The Breakroom', type: ChannelType.GuildVoice, parent: voiceCategory.id });
      await guild.channels.create({ name: 'Photo Centre', type: ChannelType.GuildVoice, parent: voiceCategory.id });

      // Post Onboarding & Ticket Panels into the setup channel
      const embed = new EmbedBuilder()
        .setTitle('🛒 Welcome to Cloud 9 - Employee Onboarding!')
        .setDescription('Amy built the store! Use the dropdown below to choose your character role and customize your experience.')
        .setColor(0x0055ff)
        .setFooter({ text: 'Powered by Amy Sosa & Cloud 9 Systems' });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('character_select')
        .setPlaceholder('Choose your Cloud 9 identity...')
        .addOptions([
          { label: 'Amy Sosa (The Realist)', description: 'Exhausted manager energy', value: 'char_amy', emoji: '☕' },
          { label: 'Jonah Simms (The Activist)', description: 'Over-explaining retail logic', value: 'char_jonah', emoji: '📚' },
          { label: 'Dina Fox (Security Chief)', description: 'Bird enthusiast & rule enforcer', value: 'char_dina', emoji: '🦅' },
          { label: 'Glenn Sturgis (The Optimist)', description: 'Wholesome church vibes', value: 'char_glenn', emoji: '😇' },
          { label: 'Mateo Liwanag (The Ambitious)', description: 'Serving absolute looks', value: 'char_mateo', emoji: '💅' },
          { label: 'Garrett Keenan (The Sarcastic)', description: 'Announcement booth operator', value: 'char_garrett', emoji: '🎧' }
        ]);

      const row1 = new ActionRowBuilder().addComponents(selectMenu);

      const ticketEmbed = new EmbedBuilder()
        .setTitle('🎫 Cloud 9 Customer Service & Support')
        .setDescription('Need help, want to report an issue, or need Myrtle to assist you? Open a ticket below!')
        .setColor(0xffaa00);

      const ticketButton = new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Open Support Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫');

      const row2 = new ActionRowBuilder().addComponents(ticketButton);

      await setupChannel.send({ embeds: [embed], components: [row1] });
      await setupChannel.send({ embeds: [ticketEmbed], components: [row2] });

      return;
    }

    // 2. Handle Character Selection (Self-Roles)
    if (interaction.isStringSelectMenu() && interaction.customId === 'character_select') {
      await interaction.deferReply({ ephemeral: true });
      const selectedKey = interaction.values[0];
      const targetRoleName = characterRoles[selectedKey];

      let role = interaction.guild.roles.cache.find(r => r.name === targetRoleName);
      
      if (!role) {
        role = await interaction.guild.roles.create({
          name: targetRoleName,
          color: 'Random',
          reason: 'Cloud 9 Automated Character Role Setup'
        });
      }

      for (const key of Object.keys(characterRoles)) {
        const rName = characterRoles[key];
        const existingRole = interaction.guild.roles.cache.find(r => r.name === rName);
        if (existingRole && interaction.member.roles.cache.has(existingRole.id)) {
          await interaction.member.roles.remove(existingRole);
        }
      }

      await interaction.member.roles.add(role);
      return interaction.editReply({ content: `Shift assigned! You are now rocking the role: **${targetRoleName}**.` });
    }

    // 3. Handle Ticket Creation
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
      const guild = interaction.guild;
      const member = interaction.member;

      const ticketChannel = await guild.channels.create({
        name: `ticket-${member.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: member.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
          },
          {
            id: client.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      const welcomeEmbed = new EmbedBuilder()
        .setTitle('🛒 Myrtle’s Help Desk')
        .setDescription(`Hello! Myrtle or another staff member will be with you shortly. State your issue below.\n\n*(Click the close button when you are finished)*`);

      await ticketChannel.send({ content: `${member}`, embeds: [welcomeEmbed], components: [closeButton]]);

      return interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
    }

    // 4. Handle Closing Tickets
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
      await interaction.reply({ content: 'Closing this ticket in 5 seconds...' });
      setTimeout(async () => {
        try {
          await interaction.channel.delete();
        } catch (err) {
          console.error('Failed to delete ticket channel:', err);
        }
      }, 5000);
    }

  } catch (error) {
    console.error('Interaction error:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: 'An error occurred processing your shift request.' }).catch(() => {});
    } else {
      await interaction.reply({ content: 'An error occurred processing your shift request.', ephemeral: true }).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
