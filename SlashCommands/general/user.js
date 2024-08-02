const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: `user`,
  description: 'Shows information, such as ID and join date, about yourself or a user.',
  type: 'CHAT_INPUT',
  options: [
    {
      name: "user",
      description: "target to see his avatar!",
      type: "USER",
      required: false,
    }
  ],
  cooldown: 5,
  botperms: ["EMBED_LINKS"],
  run: async (client, interaction, args) => {
    const user = interaction.options.getMember("user") || interaction.member;
    var userInvites = (await interaction.guild.invites.fetch()).filter(invite => invite.inviter.id === user.id).map(c => c.uses).reduce((prev, curr) => prev + curr, 0);

    let embed = new MessageEmbed()
      .setAuthor(user.user.username, user.user.displayAvatarURL())
      .addField(`User ID`, user.user.id, true)
      .addField(`Tag`, user.user.tag, true)
      .addField(`Joined Discord At`, `**\`${moment(user.user.createdTimestamp).format('DD/MM/YYYY h:mm')}\`
${moment(user.user.createdTimestamp).fromNow()}**`, true)
      .addField(`Joined Server At`, `**\`\`${moment(user.joinedAt).format('DD/MM/YYYY h:mm')}\`\`\n${moment(user.joinedTimestamp).fromNow()}**`, true)
      .addField(`Nickname`, user.nickname || "None", true)
      .addField(`Invites`, userInvites.toString(), true);

    interaction.reply({ embeds: [embed] });
  }
}