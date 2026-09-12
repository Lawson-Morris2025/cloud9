const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
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
  res.send('🛒 Amy Sosa & Cloud 9 Bot is online and ready!');
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

const roleNames = {
  // Character Roles
  'char_amy': 'Store Manager / Amy',
  'char_jonah': 'Floor Worker / Jonah',
  'char_dina': 'Security / Dina',
  'char_glenn': 'Assistant Manager / Glenn',
  'char_mateo': 'Cloud 9 Stylist / Mateo',
  'char_garrett': 'Photo Center / Garrett',
  
  // Self-Role / Notification Pings
  'ping_rewatch': 'Re-watch Club',
  'ping_groupwatch': 'Group Watch Party',
  'ping_announcements': 'Store Announcements'
};

client.once('ready', async () => {
  console.log(`Amy Sosa is on the clock! Logged in as ${client.user.tag}`);

  const data = [
    {
      name: 'build-cloud9',
      description: 'Wipes and builds the full server structure and categories.',
    },
    {
      name: 'rules',
      description: 'Posts the store rules and conduct embed.',
    },
    {
      name: 'characters',
      description: 'Posts the character selection panel with separate buttons.',
    },
    {
      name: 'selfroles',
      description: 'Posts the notification self-roles panel with separate buttons.',
    }
  ];

  await client.application.commands.set(data);
});

// --- 3. Commands & Interactivity ---
client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    // --- COMMAND 1: /build-cloud9 (Builds Server Structure & Channels) ---
    if (interaction.commandName === 'build-cloud9') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Nice try, corporate. You need Administrator permissions to let Amy remodel the store.', ephemeral: true });
      }

      await interaction.reply({ content: '☕ Amy Sosa is clocking in, wiping the old layout, and building out the store channels...', ephemeral: true });
      const guild = interaction.guild;

      // Wipe existing channels for a clean slate
      const existingChannels = await guild.channels.fetch();
      for (const [id, channel] of existingChannels) {
        await channel.delete().catch(() => {});
      }

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // --- CATEGORY 1: STORE DIRECTORY ---
      const dirCategory = await guild.channels.create({ name: '📢 CLOUD 9 DIRECTORY', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'announcements', type: ChannelType.GuildText, parent: dirCategory.id });
      await guild.channels.create({ name: 'rules-and-info', type: ChannelType.GuildText, parent: dirCategory.id });
      await guild.channels.create({ name: 'welcome', type: ChannelType.GuildText, parent: dirCategory.id });
      await guild.channels.create({ name: 'employee-onboarding', type: ChannelType.GuildText, parent: dirCategory.id });

      // --- CATEGORY 2: CLOUD 9 FLOOR ---
      const floorCategory = await guild.channels.create({ name: '☁️ CLOUD 9 FLOOR', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'break-room', type: ChannelType.GuildText, parent: floorCategory.id });
      await guild.channels.create({ name: 'cloud-9-memes', type: ChannelType.GuildText, parent: floorCategory.id });
      await guild.channels.create({ name: 'the-cold-open', type: ChannelType.GuildText, parent: floorCategory.id });

      // --- CATEGORY 3: SUPERSTORE EPISODES ---
      const showCategory = await guild.channels.create({ name: '📺 SUPERSTORE EPISODES', type: ChannelType.GuildCategory });
      await guild.channels.create({ name: 'season-1', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-2', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-3', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-4', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-5', type: ChannelType.GuildText, parent: showCategory.id });
      await guild.channels.create({ name: 'season-6', type: ChannelType.GuildText, parent: showCategory.id });

      // --- CATEGORY 4: WATCH PARTY STAGE ---
      const watchCategory = await guild.channels.create({ name: '🍿 WATCH PARTY STAGE', type: ChannelType.GuildCategory });
      await guild.channels.create({ 
        name: '🎬 Cloud 9 Watch Party', 
        type: ChannelType.GuildStageVoice, 
        parent: watchCategory.id,
        permissionOverwrites: [{ id: guild.id, deny: [PermissionsBitField.Flags.Speak] }]
      });
      await guild.channels.create({ name: '🔄 Re-watch Discussion Voice', type: ChannelType.GuildVoice, parent: watchCategory.id });
      await guild.channels.create({ name: 'The Breakroom Voice', type: ChannelType.GuildVoice, parent: watchCategory.id });

      // --- CATEGORY 5: CUSTOMER SERVICE ---
      const supportCategory = await guild.channels.create({ name: '🎫 CUSTOMER SERVICE', type: ChannelType.GuildCategory });
      const helpDeskChannel = await guild.channels.create({ name: 'help-desk', type: ChannelType.GuildText, parent: supportCategory.id });
      await guild.channels.create({ name: 'support-chat', type: ChannelType.GuildText, parent: supportCategory.id });

      await delay(1500);

      // Post initial welcome message
      const welcomeCh = guild.channels.cache.find(c => c.name === 'welcome');
      if (welcomeCh) {
        const welcomeEmbed = new EmbedBuilder()
          .setTitle('🛒 Welcome to Cloud 9!')
          .setDescription('Grab a cart, head over to **#employee-onboarding** to pick your character and notification self-roles, and try not to break anything in aisle 4!')
          .setColor(0x0055ff);
        await welcomeCh.send({ embeds: [welcomeEmbed] });
      }

      // Post initial ticket panel
      const ticketEmbed = new EmbedBuilder()
        .setTitle('🎫 Cloud 9 Customer Service & Support Desk')
        .setDescription('*(Garrett speaks into the PA)* "Need help or have a complaint? Click the button below to open a private ticket."')
        .setColor(0xffaa00);
      const ticketButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_ticket').setLabel('Open Support Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')
      );
      await helpDeskChannel.send({ embeds: [ticketEmbed], components: [ticketButton] });

      return;
    }

    // --- COMMAND 2: /rules ---
    if (interaction.commandName === 'rules') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Only management can post store rules.', ephemeral: true });
      }

      const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Cloud 9 Store Rules & Conduct')
        .setDescription('Welcome to Cloud 9! To keep our store running smoothly, please follow these policies set by corporate:')
        .setColor(0x0055ff)
        .addFields(
          { name: '1. Keep it respectful', value: 'No hate speech, harassment, or targeted bullying of any kind. Treat fellow shoppers and employees like family.' },
          { name: '2. Keep channels on-topic', value: 'Post memes in the designated meme channel, keep show discussions in the correct season channels, etc.' },
          { name: '3. No spamming or advertising', value: 'Do not flood chats, drop unauthorized invite links, or self-promote without checking with management.' },
          { name: '4. Watch Party Etiquette', value: 'Microphones are restricted to hosts/admins in the Watch Party stage so everyone can enjoy episodes peacefully.' }
        )
        .setFooter({ text: 'Failure to comply may result in a permanent shift termination by Glenn or Dina.' });

      await interaction.channel.send({ embeds: [rulesEmbed] });
      return interaction.reply({ content: 'Store rules posted successfully!', ephemeral: true });
    }

    // --- COMMAND 3: /characters (Separate Buttons for Each Character) ---
    if (interaction.commandName === 'characters') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Only management can post character selection panels.', ephemeral: true });
      }

      const charEmbed = new EmbedBuilder()
        .setTitle('🛒 Cloud 9 Employee Shift - Character Selection')
        .setDescription('*(Amy sighs)* "Click your preferred character button below to grab your nametag. You can wear one main character persona at a time!"')
        .setColor(0x0055ff);

      const rowAmy = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('char_amy').setLabel('Store Manager / Amy').setStyle(ButtonStyle.Primary).setEmoji('☕'));
      const rowJonah = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('char_jonah').setLabel('Floor Worker / Jonah').setStyle(ButtonStyle.Secondary).setEmoji('📚'));
      const rowDina = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('char_dina').setLabel('Security / Dina').setStyle(ButtonStyle.Danger).setEmoji('🦅'));
      const rowGlenn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('char_glenn').setLabel('Assistant Manager / Glenn').setStyle(ButtonStyle.Success).setEmoji('😇'));
      const rowMateo = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('char_mateo').setLabel('Cloud 9 Stylist / Mateo').setStyle(ButtonStyle.Primary).setEmoji('💅'));
      const rowGarrett = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('char_garrett').setLabel('Photo Center / Garrett').setStyle(ButtonStyle.Secondary).setEmoji('🎧'));

      await interaction.channel.send({ 
        embeds: [charEmbed], 
        components: [rowAmy, rowJonah, rowDina, rowGlenn, rowMateo, rowGarrett] 
      });
      return interaction.reply({ content: 'Character selection panel posted successfully!', ephemeral: true });
    }

    // --- COMMAND 4: /selfroles (Separate Buttons for Each Notification Ping) ---
    if (interaction.commandName === 'selfroles') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Only management can post self-role panels.', ephemeral: true });
      }

      const pingEmbed = new EmbedBuilder()
        .setTitle('🔔 Cloud 9 Self-Roles & Notification Pings')
        .setDescription('Click the individual buttons below to toggle your notification pings!')
        .setColor(0x00aa00);

      const rowRewatch = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ping_rewatch').setLabel('Re-watch Club').setStyle(ButtonStyle.Secondary).setEmoji('🔄'));
      const rowGroupwatch = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ping_groupwatch').setLabel('Group Watch Party').setStyle(ButtonStyle.Secondary).setEmoji('🍿'));
      const rowAnnounce = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ping_announcements').setLabel('Store Announcements').setStyle(ButtonStyle.Secondary).setEmoji('📢'));

      await interaction.channel.send({ 
        embeds: [pingEmbed], 
        components: [rowRewatch, rowGroupwatch, rowAnnounce] 
      });
      return interaction.reply({ content: 'Self-roles panel posted successfully!', ephemeral: true });
    }

  } catch (error) {
    console.error('Command error:', error);
  }
});

// --- 4. Button Interaction Handling ---
client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isButton()) return;

    // --- HANDLE CHARACTER BUTTON CLICKS ---
    if (interaction.customId.startsWith('char_')) {
      await interaction.deferReply({ ephemeral: true });
      const targetRoleName = roleNames[interaction.customId];
      let role = interaction.guild.roles.cache.find(r => r.name === targetRoleName);

      if (!role) {
        role = await interaction.guild.roles.create({
          name: targetRoleName,
          color: 'Random',
          reason: 'Cloud 9 Automated Role Setup'
        });
      }

      // Enforce single active character role
      for (const key of Object.keys(roleNames)) {
        if (key.startsWith('char_')) {
          const rName = roleNames[key];
          const existingRole = interaction.guild.roles.cache.find(r => r.name === rName);
          if (existingRole && interaction.member.roles.cache.has(existingRole.id)) {
            await interaction.member.roles.remove(existingRole);
          }
        }
      }

      await interaction.member.roles.add(role);
      return interaction.editReply({ content: `Shift assigned! You are now rocking the character role: **${targetRoleName}**.` });
    }

    // --- HANDLE SELF-ROLE PING BUTTON CLICKS ---
    if (interaction.customId.startsWith('ping_')) {
      await interaction.deferReply({ ephemeral: true });
      const targetRoleName = roleNames[interaction.customId];
      let role = interaction.guild.roles.cache.find(r => r.name === targetRoleName);

      if (!role) {
        role = await interaction.guild.roles.create({
          name: targetRoleName,
          color: 'Random',
          reason: 'Cloud 9 Automated Role Setup'
        });
      }

      if (interaction.member.roles.cache.has(role.id)) {
        await interaction.member.roles.remove(role);
        return interaction.editReply({ content: `Opted out of **${targetRoleName}** notifications.` });
      } else {
        await interaction.member.roles.add(role);
        return interaction.editReply({ content: `You are now signed up for **${targetRoleName}** notifications!` });
      }
    }

    // --- HANDLE TICKET CREATION ---
    if (interaction.customId === 'open_ticket') {
      const guild = interaction.guild;
      const previousMember = interaction.member;

      const ticketChannel = await guild.channels.create({
        name: `ticket-${previousMember.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: previousMember.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ],
      });

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
      );

      const welcomeEmbed = new EmbedBuilder()
        .setTitle('😇 Welcome to Glenn’s Office / Help Desk!')
        .setDescription(`Hello ${previousMember}!\n\n*(Amy sighs)* "State your issue below and we'll get it sorted out."`);

      await ticketChannel.send({ content: `${previousMember}`, embeds: [welcomeEmbed], components: [closeButton] });
      return interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
    }

    // --- HANDLE CLOSING TICKETS ---
    if (interaction.customId === 'close_ticket') {
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
  }
});

client.login(process.env.DISCORD_TOKEN);
