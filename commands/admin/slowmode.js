const { Message, Client } = require("discord.js");

const ms = require('ms')

module.exports = {

        name: "slowmode",

        description: `sets the slow mode for the channel.`,

    aliases: ["سلومود"],
        run: async (client, message, args) => {

  let args1 = message.content.split(' ').slice(1).join(' ')

  const permission = message.member.permissions.has("MANAGE_CHANNELS");

  const guilds = message.guild.me.permissions.has("MANAGE_CHANNELS");

  if (!permission) return message.reply({ content: ":x: **You don't have permission to use this command**" }).catch((err) => {

          console.log(`i couldn't reply to the message: ` + err.message)

  })

  if (!args[0]) return message.reply({ content: `:rolling_eyes: **Please provide a valid Time**` }).catch((err) => {

          console.log(`i couldn't reply to the message: ` + err.message)

  })

  if (!guilds) return message.reply({ content: `:rolling_eyes: **Please check my permissions and role position.**` }).catch((err) => {

          console.log(`i couldn't reply to the message: ` + err.message)

  })

  let time = args1

  if (args1.endsWith('m')) {

          time = args1.split('m')

          time = time[0] * 60

  }

  if (args1.endsWith('h')) {

          time = args1.split('h')

          time = time[0] * 60 * 60

  }

  if (args1.endsWith('s')) {

          time = args1.split('s')

          time = time[0]

  }

  if(time > 21600) return message.reply({content: `:rolling_eyes: **The time must be less than 6 hours**`})

  if(isNaN(time)) return message.reply({content: `:rolling_eyes: **Please provide a valid time**`})

  message.channel.setRateLimitPerUser(time , `Reqested by : ${message.author.tag}`)

          .then(() => {

                  message.reply({ content: `:white_check_mark: **Done set the channel slowmode to ${args1}**` })

          }).catch((err) => 0)

        },

};