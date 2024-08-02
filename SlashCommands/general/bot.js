const { MessageEmbed } = require("discord.js")
const package = require("../../package.json");

module.exports = {
  name:`bot`,
  description: 'get info about this bot',
  type: 'CHAT_INPUT',
  botperms:["EMBED_LINKS"],
  cooldown:10,
  run:async(client, interaction,args) => {
    let discordJSVersion = package.dependencies["discord.js"];
    let embed = new MessageEmbed()                      .setAuthor({name:client.user.username})
      .setImage(client.user.avatarURL())
    .addField(`Servers`,`➥ \`${client.guilds.cache.size}\``,true)
    .addField(`Channels`,`➥ \`${client.channels.cache.size}\``,true)
    .addField(`Users`,`➥ \`${client.users.cache.size}\``,true)
    .addField(`Library`,`➥ \`Discord JS ${discordJSVersion.slice(1,discordJSVersion.length)}\``,true)
    .addField(`Node.js`,`➥ \`${process.version}\``,true)
    .addField(`Uptime`,`➥ <t:${Math.floor((Date.now() - client.uptime)/1000)}:R>`,true)
    .addField(`Ping`,`➥ ${client.ws.ping}`,true)
    .addField(`My Developer`,`➥ Reiner 🤞🏻`,true)
    .setFooter({text:"Requested by " + interaction.user.tag,iconURL:interaction.user.displayAvatarURL({ dynamic: true })})
    interaction.reply({embeds:[embed]}).catch(err => 0)
  }
}