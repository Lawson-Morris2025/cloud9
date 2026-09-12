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

// --- 2. Discord Bot Setup ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const managedRoles = {
  // Characters
  'char_amy': 'Store Manager / Amy',
  'char_jonah': 'Floor Worker / Jonah',
  'char_dina': 'Security / Dina',
  'char_glenn': 'Assistant Manager / Glenn',
  'char_mateo': 'Cloud 9 Stylist / Mateo',
  'char_garrett': 'Photo Center / Garrett',
  // Notification Pings
  'ping_rewatch': 'Re-watch Club',
  'ping_groupwatch': 'Group Watch Party',
  'ping_announcements': 'Store Announcements'
};

client.once('ready', async () => {
  console.log(`Cloud 9 Systems Online! Logged in as ${client.user.tag}`);

  const data = [
    {
      name: 'build-cloud9',
      description: 'Amy Sosa wipes the store clean and builds the ultimate Superstore server architecture (Admin only)',
    }
  ];

  await client.application.commands.set(data);
});

client.on('interactionCreate', async interaction => {
  try {
    // 1. Automated Server Building & Reset Command
    if (interaction.isChatInputCommand() && interaction.commandName === 'build-cloud9') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Nice try, corporate. You need Administrator permissions to let Amy remodel the store.', ephemeral: true });
      }

      await interaction.reply({ content: '☕ Amy Sosa is clocking in, tearing down the old layout, and rebuilding Cloud 9 from scratch...', ephemeral: true });
      const guild = interaction.guild;

      // Wipe existing channels for a completely fresh build
      const existingChannels = await guild.channels.fetch();
      for (const [id, channel] of existingChannels) {
        await channel.delete().catch(() => {});
      }

      // Create Categories & Channels
      const welcomeCategory = await guild.channels.create({ name: '📢 CLOUD 9 DIRECTORY', type: ChannelType.GuildCategory });
      const rulesChannel = await guild.channels.create({ name: 'rules-and-info', type: ChannelType.GuildText, parent: welcomeCategory.id });
      await guild.channels.create({ name: 'welcome', type: ChannelType.GuildText, parent: welcomeCategory.id });
      await guild.channels.create({ name: 'employee-handbook', type: ChannelType.GuildText, parent: welcomeCategory.id });
      const setupChannel = await guild.channels.create({ name: 'employee-onboarding', type: ChannelType.GuildText, parent: welcomeCategory.id });

      const floorCategory = await guild.channels.create({ name: '☁️ CLOUD 9 FLOOR', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'break-room', type: ChannelType.GuildText, parent: floorCategory.id });
      await guild.channels.create({ name: 'cloud-9-memes', type: ChannelType.GuildText, parent: floorCategory.id });
      await guild.channels.create({ name: 'the-cold-open', type: ChannelType.GuildText, parent: floorCategory.id });

      const showCategory = await guild.channels.create({ name: '📺 SUPERSTORE EPISODES', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'season-1', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-2', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-3', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-4', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-5', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-6', type: ChannelType.GuildText, parent: showCategory.id });

      const watchCategory = await guild.channels.create({ name: '🍿 WATCH PARTY STAGE', type: ChannelType.GuildCategory });
      
      // Watch Party Stage where only Admins can speak by default
      await guild.channels.create({ 
        name: '🎬 Cloud 9 Watch Party', 
        type: ChannelType.GuildStageVoice, 
        parent: watchCategory.id,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.Speak], // Muted for everyone by default
          },
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.Speak],
          }
        ]
      });

      await guild.channels.create({ 
        name: 'The Breakroom Voice', 
        type: ChannelType.GuildVoice, 
        parent: watchCategory.id 
      });

      const supportCategory = await guild.channels.create({ name: '🎫 CUSTOMER SERVICE', type: ChannelType.GuildCategory });
      const helpDeskChannel = await guild.channels.create({ name: 'help-desk', type: ChannelType.GuildText, parent: supportCategory.id });

      // Populate Rules Channel
      const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Cloud 9 Store Rules & Conduct')
        .setDescription('Welcome to Cloud 9! To keep our store running smoothly, please follow these policies set by corporate:')
        .setColor(0x0055ff)
        .addFields(
          { name: '1. Keep it respectful', value: 'No hate speech, racism, sexism, harassment, or targeted bullying of any kind. Treat fellow shoppers and employees like family.' },
          { name: '2. Keep channels on-topic', value: 'Post memes in the designated meme channel, keep show discussions in the correct season channels, etc.' },
          { name: '3. No spamming or advertising', value: 'Do not flood chats, drop unauthorized invite links, or self-promote without checking with management.' },
          { name: '4. Watch Party Etiquette', value: 'Microphones are restricted to hosts/admins in the Watch Party stage so everyone can enjoy the episodes peacefully.' }
        )
        .setFooter({ text: 'Failure to comply may result in a permanent shift termination by Glenn or Dina.' });

      await rulesChannel.send({ embeds: [rulesEmbed] });

      // Post Onboarding & Ticket Panels
      const embed = new EmbedBuilder()
        .setTitle('🛒 Welcome to Cloud 9 - Employee Onboarding!')
        .setDescription('Amy built the store! Use the dropdown below to choose your character identity and opt-in to watch party pings.')
        .setColor(0x0055ff)
        .setFooter({ text: 'Powered by Amy Sosa & Cloud 9 Systems' });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('character_select')
        .setPlaceholder('Choose your Cloud 9 identity & ping preferences...')
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

      const row1 = new ActionRowBuilder().addComponents(selectMenu);

      const ticketEmbed = new EmbedBuilder()
        .setTitle('🎫 Cloud 9 Customer Service & Support')
        .setDescription('Need help, want to report corporate misconduct, or need Glenn & Myrtle to assist you? Open a ticket below!')
        .setColor(0xffaa00);

      const ticketButton = new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Open Support Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫');

      const row2 = new ActionRowBuilder().addComponents(ticketButton);

      await setupChannel.send({ embeds: [embed], components: [row1] });
      await helpDeskChannel.send({ embeds: [ticketEmbed], components: [row2] });

      return;
    }

    // 2. Handle Role Selection (Toggleable Roles)
    if (interaction.isStringSelectMenu() && interaction.customId === 'character_select') {
      await interaction.deferReply({ ephemeral: true });
      const selectedKey = interaction.values[0];
      const targetRoleName = managedRoles[selectedKey];

      let role = interaction.guild.roles.cache.find(r => r.name === targetRoleName);
      
      if (!role) {
        role = await interaction.guild.roles.create({
          name: targetRoleName,
          color: 'Random',
          reason: 'Cloud 9 Automated Role Setup'
        });
      }

      // If it's a character role, clear other character roles first so they only hold one persona
      if (selectedKey.startsWith('char_')) {
        for (const key of Object.keys(managedRoles)) {
          if (key.startsWith('char_')) {
            const rName = managedRoles[key];
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

    // 3. Handle Ticket Creation (Glenn's Office Help Desk)
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
        .setTitle('😇 Welcome to Glenn’s Office!')
        .setDescription(`Hello ${member}!\n\n*(In Glenn's wholesome voice)* "Welcome, welcome! Don't be shy, tell Glenn and Myrtle what's on your mind so we can help you out with a smile!"\n\nState your issue below. Click the close button when you're all finished.`);

      await ticketChannel.send({ content: `${member}`, embeds: [welcomeEmbed], components: [closeButton] });

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
