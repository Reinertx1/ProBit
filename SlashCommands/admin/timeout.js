const { MessageEmbed } = require("discord.js")

const ms = require("ms")

module.exports = {

  name:`timeout`,

  description: 'Timeout a user from sending messages, react or join voice channels.',

  type: 'CHAT_INPUT',

  options:[

    {

      name:"user",

      description: "The user to timeout",

      type:"USER",

      required:true,

    },

    {

      name:"time",

      description: "The duration of timeout (e.g., 60s, 5m, 1h, 1d)",

      type:"STRING",

      required:true,

    },

    {

      name:"reason",

      description: "The reason of timeout.",

      type:"STRING",

      required:false,

    }

  ],

  userPermissions:["MODERATE_MEMBERS"],

  botPermissions:["MODERATE_MEMBERS"],

  run:async(client, interaction,args) => {

    let target = interaction.options.getMember("user");

    if(!target) return interaction.reply({content: "User not found."});

    

    let time = interaction.options.getString("time");

    let reason = interaction.options.getString("reason") || "No Reason";

    let duration = ms(time);

    if (!duration) return interaction.reply({content: "Invalid time format. Please provide a valid duration like '60s', '5m', '1h', '1d'."});

    if(target.permissions.has("ADMINISTRATOR")){

      return interaction.reply({content:`**🙄 - You can't timeout @${target.user.username}. **`});

    }

    target.timeout(duration, reason).then(_ => {

      return interaction.reply({content:`**✅ ${target.user.username} has been timed out!**`});

    }).catch(err =>  {

      return interaction.reply({content:`🙄 - I couldn't timeout that user. Please check my permissions and role position.`});

    });

  }

}