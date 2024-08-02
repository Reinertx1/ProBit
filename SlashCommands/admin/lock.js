const { MessageEmbed } = require("discord.js");

module.exports = {

  name: "lock",

  description: `🔒 Disables @everyone or someone from sending messages in a specific channel.`,

  type: 'CHAT_INPUT',

  options: [

    {

      name: "target",

      description: "Channel to lock.",

      type: "CHANNEL",

      required: false,

      channel_types: [0, 5] // Text and Announcement channels

    },

    {

      name: "user",

      description: "User to lock in the specific channel.",

      type: "USER",

      required: false,

    },

    {

      name: "reason",

      description: "Reason for locking the channel or user.",

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

    // تعيين الأذونات إلى "ممنوع" (❌) للأذونات المحددة

    channel.permissionOverwrites.edit(user ? user.id : interaction.guild.id, {

      SEND_MESSAGES: false, // منع إرسال الرسائل في القناة

      SEND_MESSAGES_IN_THREADS: false, // منع إرسال الرسائل في المواضيع

      CREATE_PUBLIC_THREADS: false, // منع إنشاء المواضيع العامة

      CREATE_PRIVATE_THREADS: false // منع إنشاء المواضيع الخاصة

    }).catch(err => 0);

    let msgLock = `🔒 **<#${channel.id}> has been locked${user ? ` for ${user}` : ""}${reason ? `.\nReason: ${reason}` : ""}.**`;

    return interaction.reply({ content: msgLock });

  },

};