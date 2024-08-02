const { Message, Client } = require("discord.js");

module.exports = {

        name: "clear",

        description: `cleans messages from a channel.`,
aliases: ["تنظيف"],
        run: async (client, message, args) => {

        const permission = message.member.permissions.has("MANAGE_MESSAGES");

        const guilds = message.guild.me.permissions.has("MANAGE_MESSAGES");

                if (!permission)

                        return message.reply(

                                { content: ":x: **You don't have permission to use this command**", ephemeral: true }

         ).catch((err) => {

                                console.log(`i couldn't reply to the message: ` + err.message)

          })

          

             if (!guilds) return message.reply({ content: `:rolling_eyes: **I couldn't ban that user. Please check my permissions and role position.**`, ephemeral: true }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

      }) 

    args[0] = args[0] ? parseInt(args[0]) : 100;        

    if(isNaN(args[0])) return message.reply({ content: `Please provide valid number` }).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

    });

    if (args[0] > 100) return message.reply({content: `:rolling_eyes: **You can't delete more than __100__ messages**`}).catch((err) => {

                        console.log(`i couldn't reply to the message: ` + err.message)

      })

    

    if (args[0] < 2) return message.reply({content: `:rolling_eyes: **You need to delete at least __2__ messages**`}).catch((err) => {

        console.log(`i couldn't reply to the message: ` + err.message)

      })

          

let messages = await message.channel.messages.fetch({ limit: args[0] })

messages = messages.filter(m => Date.now() - (new Date(m.createdTimestamp)).getTime() <= (14 * 24 * 60 * 60000))

  message.channel.bulkDelete(messages).catch(err => console.log(err.message))

            

      message.channel.send(`\`\`\`js

 ${messages.size} messages have been deleted.\`\`\`

`).then(replymessage => {

    setTimeout(() => replymessage.delete(), 6000);

      }).catch((err) => {

    console.log(`i couldn't reply to the message: ` + err.message)

      })

  },

}