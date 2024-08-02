const { MessageEmbed } = require("discord.js");

module.exports = {

  name: "unlock",

  description: `🔓 Allows @everyone or someone to send messages in a specific channel.`,

  type: 'CHAT_INPUT',

  options: [

    {

      name: "target",

      description: "Channel to unlock.",

      type: "CHANNEL",

      required: false,

      channel_types: [0, 5] // Text and Announcement channels

    },

    {

      name: "user",

      description: "User to unlock in the specific channel.",

      type: "USER",

      required: false,

    },

    {

      name: "reason",

      description: "Reason for unlocking the channel or user.",

      type: "STRING",

      required: false,

    }

  ],

  userPermissions: ["MANAGE_CHANNELS"],

  botPermissions: ["MANAGE_CHANNELS", "MANAGE_ROLES", "EMBED_LINKS"],

  run: async (client, interaction, args) => {

    let channel = interaction.options.getChannel("target") || interaction.channel;

    let user = interaction.options.getMember("user");

    let reason = interaction.options.getString("reason");

    // إزالة الأذونات المخصصة وإعادتها إلى الحالة الافتراضية (كما في الصورة)

    channel.permissionOverwrites.edit(user ? user.id : interaction.guild.id, {

      SEND_MESSAGES: null, // إعادة الأذونات إلى الحالة الافتراضية

      SEND_MESSAGES_IN_THREADS: null, // إعادة الأذونات إلى الحالة الافتراضية

      CREATE_PUBLIC_THREADS: null, // إعادة الأذونات إلى الحالة الافتراضية

      CREATE_PRIVATE_THREADS: null // إعادة الأذونات إلى الحالة الافتراضية

    }).catch(err => 0);

    let msgUnLock = `🔓 **<#${channel.id}> has been unlocked${user ? ` for ${user}` : ""}${reason ? `.\nReason: ${reason}` : ""}.**`;

    return interaction.reply({ content: msgUnLock });

  },

};