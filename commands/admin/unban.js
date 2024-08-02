const { Message, Client } = require("discord.js");

module.exports = {

        name: "unban",

        description: `Unbans a memeber.`,
aliases: ["فك"],
        run: async (client, message, args) => {

                const permission = message.member.permissions.has("BAN_MEMBERS");

                const guilds = message.guild.me.permissions.has("BAN_MEMBERS");

                if (!permission)

                        return message.reply(

                                { content: ":x: **You don't have permission to use this command**", ephemeral: true }

                        ).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

                        })

                if (!guilds) return message.reply({ content: `:rolling_eyes: **I couldn't unban that user. Please check my permissions and role position.**`, ephemeral: true }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

                })

                let user = message.content.split(" ").slice(1).join(" ");

                if (!user) return message.reply({

                        content: `:rolling_eyes: **Please mention member or id**`,

                        ephemeral: true

                }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

                })

                message.guild.members.unban(user).then(m => {

                        message.reply({

                                content: `:white_check_mark: **${m.username} Unbanned!**`,

                                ephemeral: true

                        }).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

                        })

                }).catch(err => {

                        message.reply({

                                content: `:rolling_eyes: **I can't find <${user}> in the ban list**`,

                                ephemeral: true

                        }).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

                        })

                })

        },

};