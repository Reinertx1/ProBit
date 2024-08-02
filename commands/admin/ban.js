const { Message, Client } = require("discord.js");

module.exports = {

        name: "ban",

        description: `Bans a memeber.`,
aliases: ["حظر"],
        run: async (client, message, args) => {

                const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

                const permission = message.member.permissions.has("BAN_MEMBERS");

                const guilds = message.guild.me.permissions.has("BAN_MEMBERS");

                if (!permission)

                        return message.reply(

                                { content: ":x: **You don't have permission to use this command**", ephemeral: true }

                        ).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

                        })

                if (!args[0]) return message.reply({ content: `:rolling_eyes: **Please mention member or id**`, ephemeral: true }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

                })

          

                if (!member) return message.reply({ content: `:rolling_eyes: **I can't find this member**`, ephemeral: true }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

                })

                if (member.id === message.member.id)

              return message.reply({ content: `:rolling_eyes: **You can't ban ${member.user.username}**`, ephemeral: true }).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

                        })

                if (message.member.roles.highest.position < member.roles.highest.position)

                        return message.reply({

                                content:

                                        `:rolling_eyes: **You can't ban ${member.user.username} have higher role than you**`

                                , ephemeral: true

                        }).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

                        })

                if (!guilds) return message.reply({ content: `:rolling_eyes: **I couldn't ban that user. Please check my permissions and role position.**`, ephemeral: true }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

                })

          

   if (!member.bannable) return message.reply(`:rolling_eyes: **You can't ban ${member.user.username}**`).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

                })

          

      return (

      (await member.ban()) +

            message.reply({ content: `:white_check_mark: **${member.user.username} banned from the server!** :airplane:`, ephemeral: true }).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

                        })

                );

        },

};

